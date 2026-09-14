package org.gga.skills.service;

import org.gga.skills.config.AuthorizationConfig.AuthorizationProperties;
import org.gga.skills.config.AuthorizationConfig.ReviewerConfig;
import org.gga.skills.config.AuthorizationConfig.ReviewerPermissions;
import org.gga.skills.model.Employee;
import org.gga.skills.model.Role;
import org.gga.skills.model.SkillGrade;
import org.gga.skills.repository.EmployeeRepository;
import org.gga.skills.repository.EmployeeSkillProfileRepository;
import org.gga.skills.repository.SkillGradeRepository;
import org.gga.skills.util.GlobMatcher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorizationService {

    private final AuthorizationProperties authorizationProperties;
    private final EmployeeRepository employeeRepository;
    private final SkillGradeRepository skillGradeRepository;
    private final EmployeeSkillProfileRepository employeeSkillProfileRepository;

    public AuthorizationService(AuthorizationProperties authorizationProperties,
                                EmployeeRepository employeeRepository,
                                SkillGradeRepository skillGradeRepository,
                                EmployeeSkillProfileRepository employeeSkillProfileRepository) {
        this.authorizationProperties = authorizationProperties;
        this.employeeRepository = employeeRepository;
        this.skillGradeRepository = skillGradeRepository;
        this.employeeSkillProfileRepository = employeeSkillProfileRepository;
    }

    public Role resolveRole(String email) {
        if (authorizationProperties.admins().stream()
                .anyMatch(admin -> admin.equalsIgnoreCase(email))) {
            return Role.ADMIN;
        }

        if (authorizationProperties.reviewers().stream()
                .anyMatch(r -> r.email().equalsIgnoreCase(email))) {
            return Role.REVIEWER;
        }

        return Role.EMPLOYEE;
    }

    public boolean canEditEmployee(String currentUserEmail, Long targetEmployeeId) {
        Role role = resolveRole(currentUserEmail);
        if (role == Role.ADMIN) {
            return true;
        }

        Employee currentEmployee = employeeRepository.findByEmail(currentUserEmail).orElse(null);
        return currentEmployee != null && currentEmployee.getId().equals(targetEmployeeId);
    }

    public boolean canEditEmployeeSkillGrade(String currentUserEmail, Long targetEmployeeId, Long skillGradeId) {
        Role role = resolveRole(currentUserEmail);
        if (role == Role.ADMIN) {
            return true;
        }

        Employee currentEmployee = employeeRepository.findByEmail(currentUserEmail).orElse(null);
        if (currentEmployee != null && currentEmployee.getId().equals(targetEmployeeId)) {
            return true;
        }

        if (role == Role.REVIEWER) {
            return evaluateReviewerPermissions(currentUserEmail, targetEmployeeId, skillGradeId);
        }

        return false;
    }

    private boolean evaluateReviewerPermissions(String reviewerEmail, Long targetEmployeeId, Long skillGradeId) {
        Optional<ReviewerConfig> reviewerConfig = authorizationProperties.reviewers().stream()
                .filter(r -> r.email().equalsIgnoreCase(reviewerEmail))
                .findFirst();

        if (reviewerConfig.isEmpty()) {
            return false;
        }

        ReviewerPermissions permissions = reviewerConfig.get().permissions();
        Employee targetEmployee = employeeRepository.findById(targetEmployeeId).orElse(null);
        if (targetEmployee == null) {
            return false;
        }

        if (matchesAny(targetEmployee.getDepartment(), permissions.departmentPatterns())) {
            return true;
        }

        if (matchesAny(targetEmployee.getEmail(), permissions.emailPatterns())) {
            return true;
        }

        List<String> profileNames = employeeSkillProfileRepository.findByEmployeeId(targetEmployeeId).stream()
                .map(esp -> esp.getSkillProfile().getName())
                .toList();
        if (profileNames.stream().anyMatch(name -> matchesAny(name, permissions.profilePatterns()))) {
            return true;
        }

        if (skillGradeId != null) {
            SkillGrade skillGrade = skillGradeRepository.findById(skillGradeId).orElse(null);
            if (skillGrade != null && matchesAny(skillGrade.getSkill().getName(), permissions.skillPatterns())) {
                return true;
            }
        }

        return false;
    }

    private boolean matchesAny(String value, List<String> patterns) {
        if (patterns == null || patterns.isEmpty() || value == null) {
            return false;
        }
        return patterns.stream().anyMatch(pattern -> GlobMatcher.matches(value, pattern));
    }
}
