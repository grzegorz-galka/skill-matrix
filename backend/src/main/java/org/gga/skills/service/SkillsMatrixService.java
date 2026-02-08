package org.gga.skills.service;

import org.gga.skills.dto.SkillsMatrixFilterRequest;
import org.gga.skills.dto.SkillsMatrixResponse;
import org.gga.skills.dto.SkillsMatrixResponse.*;
import org.gga.skills.model.Employee;
import org.gga.skills.model.EmployeeSkillGrade;
import org.gga.skills.model.Skill;
import org.gga.skills.model.SkillProfileSkill;
import org.gga.skills.repository.EmployeeRepository;
import org.gga.skills.repository.EmployeeSkillGradeRepository;
import org.gga.skills.repository.SkillProfileSkillRepository;
import org.gga.skills.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillsMatrixService {

    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final SkillProfileSkillRepository skillProfileSkillRepository;
    private final EmployeeSkillGradeRepository employeeSkillGradeRepository;

    public SkillsMatrixService(
            EmployeeRepository employeeRepository,
            SkillRepository skillRepository,
            SkillProfileSkillRepository skillProfileSkillRepository,
            EmployeeSkillGradeRepository employeeSkillGradeRepository) {
        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
        this.skillProfileSkillRepository = skillProfileSkillRepository;
        this.employeeSkillGradeRepository = employeeSkillGradeRepository;
    }

    @Transactional(readOnly = true)
    public SkillsMatrixResponse getSkillsMatrix(SkillsMatrixFilterRequest filter) {
        List<Employee> filteredEmployees = filterEmployees(filter);
        List<Skill> filteredSkills = filterSkills(filter);

        if (filteredEmployees.isEmpty() || filteredSkills.isEmpty()) {
            return new SkillsMatrixResponse(List.of(), List.of(), Map.of(), Map.of());
        }

        Set<Long> employeeIds = filteredEmployees.stream()
                .map(Employee::getId)
                .collect(Collectors.toSet());

        Set<Long> skillIds = filteredSkills.stream()
                .map(Skill::getId)
                .collect(Collectors.toSet());

        Map<Long, List<String>> skillProfileNamesBySkillId = buildSkillProfileNamesMap(skillIds);

        List<EmployeeSkillGrade> allGrades = employeeSkillGradeRepository.findAll();
        List<EmployeeSkillGrade> relevantGrades = allGrades.stream()
                .filter(esg -> employeeIds.contains(esg.getEmployee().getId()))
                .filter(esg -> skillIds.contains(esg.getSkillGrade().getSkill().getId()))
                .toList();

        Map<String, MatrixCell> cells = buildCellsMap(relevantGrades);

        // Find employees and skills that have at least one grade (filter out empty rows/columns)
        Set<Long> employeesWithGrades = relevantGrades.stream()
                .map(esg -> esg.getEmployee().getId())
                .collect(Collectors.toSet());

        Set<Long> skillsWithGrades = relevantGrades.stream()
                .map(esg -> esg.getSkillGrade().getSkill().getId())
                .collect(Collectors.toSet());

        List<MatrixEmployee> matrixEmployees = filteredEmployees.stream()
                .filter(e -> employeesWithGrades.contains(e.getId()))
                .map(this::toMatrixEmployee)
                .toList();

        List<MatrixSkill> matrixSkills = filteredSkills.stream()
                .filter(s -> skillsWithGrades.contains(s.getId()))
                .map(s -> toMatrixSkill(s, skillProfileNamesBySkillId.getOrDefault(s.getId(), List.of())))
                .toList();

        Map<Long, SkillSummary> skillSummaries = buildSkillSummaries(relevantGrades, skillsWithGrades);

        return new SkillsMatrixResponse(matrixEmployees, matrixSkills, cells, skillSummaries);
    }

    @Transactional(readOnly = true)
    public SkillsMatrixFilterHints getFilterHints() {
        List<Employee> employees = employeeRepository.findAll();
        List<Skill> skills = skillRepository.findAll();
        List<SkillProfileSkill> skillProfileSkills = skillProfileSkillRepository.findAll();

        List<String> names = employees.stream()
                .map(e -> e.getFirstName() + " " + e.getLastName())
                .distinct()
                .sorted()
                .toList();

        List<String> departments = employees.stream()
                .map(Employee::getDepartment)
                .filter(Objects::nonNull)
                .filter(d -> !d.isBlank())
                .distinct()
                .sorted()
                .toList();

        List<String> positions = employees.stream()
                .map(Employee::getPosition)
                .filter(Objects::nonNull)
                .filter(p -> !p.isBlank())
                .distinct()
                .sorted()
                .toList();

        List<String> skillNames = skills.stream()
                .map(Skill::getName)
                .distinct()
                .sorted()
                .toList();

        List<String> skillProfileNames = skillProfileSkills.stream()
                .map(sps -> sps.getSkillProfile().getName())
                .distinct()
                .sorted()
                .toList();

        return new SkillsMatrixFilterHints(names, departments, positions, skillNames, skillProfileNames);
    }

    public record SkillsMatrixFilterHints(
            List<String> names,
            List<String> departments,
            List<String> positions,
            List<String> skillNames,
            List<String> skillProfileNames
    ) {}

    private List<Employee> filterEmployees(SkillsMatrixFilterRequest filter) {
        List<Employee> employees = employeeRepository.findAll();

        return employees.stream()
                .filter(e -> matchesAnyPattern(
                        e.getFirstName() + " " + e.getLastName(),
                        filter.namePatterns()))
                .filter(e -> matchesAnyPattern(e.getDepartment(), filter.departmentPatterns()))
                .filter(e -> matchesAnyPattern(e.getPosition(), filter.positionPatterns()))
                .toList();
    }

    private List<Skill> filterSkills(SkillsMatrixFilterRequest filter) {
        List<Skill> skills = skillRepository.findAll();

        if (filter.skillNamePatterns().isEmpty() && filter.skillProfilePatterns().isEmpty()) {
            return skills;
        }

        Map<Long, List<String>> skillProfileNamesBySkillId = buildSkillProfileNamesMap(
                skills.stream().map(Skill::getId).collect(Collectors.toSet()));

        return skills.stream()
                .filter(s -> matchesAnyPattern(s.getName(), filter.skillNamePatterns()))
                .filter(s -> matchesAnySkillProfilePattern(
                        skillProfileNamesBySkillId.getOrDefault(s.getId(), List.of()),
                        filter.skillProfilePatterns()))
                .toList();
    }

    private Map<Long, List<String>> buildSkillProfileNamesMap(Set<Long> skillIds) {
        List<SkillProfileSkill> allSps = skillProfileSkillRepository.findAll();
        return allSps.stream()
                .filter(sps -> skillIds.contains(sps.getSkill().getId()))
                .collect(Collectors.groupingBy(
                        sps -> sps.getSkill().getId(),
                        Collectors.mapping(
                                sps -> sps.getSkillProfile().getName(),
                                Collectors.toList())));
    }

    private boolean matchesAnyPattern(String value, List<String> patterns) {
        if (patterns.isEmpty()) {
            return true;
        }
        if (value == null) {
            return false;
        }
        String lowerValue = value.toLowerCase();
        return patterns.stream()
                .anyMatch(pattern -> matchesWildcard(lowerValue, pattern.toLowerCase()));
    }

    private boolean matchesAnySkillProfilePattern(List<String> profileNames, List<String> patterns) {
        if (patterns.isEmpty()) {
            return true;
        }
        if (profileNames.isEmpty()) {
            return false;
        }
        return profileNames.stream()
                .anyMatch(name -> matchesAnyPattern(name, patterns));
    }

    private boolean matchesWildcard(String value, String pattern) {
        String regex = pattern
                .replace(".", "\\.")
                .replace("*", ".*")
                .replace("?", ".");
        return value.matches(regex);
    }

    private MatrixEmployee toMatrixEmployee(Employee e) {
        return new MatrixEmployee(
                e.getId(),
                e.getFirstName(),
                e.getLastName(),
                e.getEmail(),
                e.getDepartment(),
                e.getPosition());
    }

    private MatrixSkill toMatrixSkill(Skill s, List<String> profileNames) {
        return new MatrixSkill(s.getId(), s.getName(), profileNames);
    }

    private Map<String, MatrixCell> buildCellsMap(List<EmployeeSkillGrade> grades) {
        Map<String, MatrixCell> cells = new HashMap<>();
        for (EmployeeSkillGrade esg : grades) {
            Long employeeId = esg.getEmployee().getId();
            Long skillId = esg.getSkillGrade().getSkill().getId();
            String key = SkillsMatrixResponse.cellKey(employeeId, skillId);

            cells.put(key, new MatrixCell(
                    employeeId,
                    skillId,
                    esg.getSkillGrade().getId(),
                    esg.getSkillGrade().getCode(),
                    esg.getSkillGrade().getDescription(),
                    esg.getSkillGrade().getLevel(),
                    esg.getYearsOfExperience(),
                    esg.getCertified()));
        }
        return cells;
    }

    private Map<Long, SkillSummary> buildSkillSummaries(List<EmployeeSkillGrade> grades, Set<Long> skillIds) {
        Map<Long, Map<String, Long>> countsBySkill = new HashMap<>();

        for (Long skillId : skillIds) {
            countsBySkill.put(skillId, new HashMap<>());
        }

        for (EmployeeSkillGrade esg : grades) {
            Long skillId = esg.getSkillGrade().getSkill().getId();
            String gradeCode = esg.getSkillGrade().getCode();

            countsBySkill.computeIfAbsent(skillId, k -> new HashMap<>())
                    .merge(gradeCode, 1L, Long::sum);
        }

        return countsBySkill.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> new SkillSummary(e.getKey(), e.getValue())));
    }
}
