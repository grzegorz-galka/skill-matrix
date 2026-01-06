package org.gga.skills.service;

import org.gga.skills.dto.EmployeeSkillGradeRequest;
import org.gga.skills.dto.EmployeeSkillGradeResponse;
import org.gga.skills.model.Employee;
import org.gga.skills.model.EmployeeSkillGrade;
import org.gga.skills.model.SkillGrade;
import org.gga.skills.repository.EmployeeRepository;
import org.gga.skills.repository.EmployeeSkillGradeRepository;
import org.gga.skills.repository.SkillGradeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class EmployeeSkillGradeService {

    private final EmployeeSkillGradeRepository employeeSkillGradeRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillGradeRepository skillGradeRepository;

    public EmployeeSkillGradeService(EmployeeSkillGradeRepository employeeSkillGradeRepository,
                                      EmployeeRepository employeeRepository,
                                      SkillGradeRepository skillGradeRepository) {
        this.employeeSkillGradeRepository = employeeSkillGradeRepository;
        this.employeeRepository = employeeRepository;
        this.skillGradeRepository = skillGradeRepository;
    }

    public Page<EmployeeSkillGradeResponse> getAllEmployeeSkillGrades(Pageable pageable) {
        return employeeSkillGradeRepository.findAll(pageable)
                .map(EmployeeSkillGradeResponse::fromEntity);
    }

    public EmployeeSkillGradeResponse getEmployeeSkillGradeById(Long id) {
        EmployeeSkillGrade esg = employeeSkillGradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee skill grade not found with id: " + id));
        return EmployeeSkillGradeResponse.fromEntity(esg);
    }

    public List<EmployeeSkillGradeResponse> getEmployeeSkillGradesByEmployeeId(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found with id: " + employeeId);
        }
        return employeeSkillGradeRepository.findByEmployeeId(employeeId).stream()
                .map(EmployeeSkillGradeResponse::fromEntity)
                .toList();
    }

    public List<EmployeeSkillGradeResponse> getEmployeeSkillGradesBySkillGradeId(Long skillGradeId) {
        if (!skillGradeRepository.existsById(skillGradeId)) {
            throw new ResourceNotFoundException("Skill grade not found with id: " + skillGradeId);
        }
        return employeeSkillGradeRepository.findBySkillGradeId(skillGradeId).stream()
                .map(EmployeeSkillGradeResponse::fromEntity)
                .toList();
    }

    @Transactional
    public EmployeeSkillGradeResponse createEmployeeSkillGrade(EmployeeSkillGradeRequest request) {
        if (employeeSkillGradeRepository.existsByEmployeeIdAndSkillGradeId(
                request.employeeId(), request.skillGradeId())) {
            throw new DuplicateResourceException("Employee skill grade already exists for employee id: " +
                    request.employeeId() + " and skill grade id: " + request.skillGradeId());
        }

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.employeeId()));

        SkillGrade skillGrade = skillGradeRepository.findById(request.skillGradeId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill grade not found with id: " + request.skillGradeId()));

        EmployeeSkillGrade esg = new EmployeeSkillGrade(employee, skillGrade);
        esg.setYearsOfExperience(request.yearsOfExperience());
        esg.setLastUsedDate(request.lastUsedDate());
        esg.setCertified(request.certified() != null ? request.certified() : false);
        esg.setEmployeeComment(request.employeeComment());

        if (request.reviewedByEmployeeId() != null) {
            Employee reviewer = employeeRepository.findById(request.reviewedByEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reviewer employee not found with id: " + request.reviewedByEmployeeId()));
            esg.setReviewedBy(reviewer);
        }
        esg.setReviewerComment(request.reviewerComment());

        EmployeeSkillGrade saved = employeeSkillGradeRepository.save(esg);
        return EmployeeSkillGradeResponse.fromEntity(saved);
    }

    @Transactional
    public EmployeeSkillGradeResponse updateEmployeeSkillGrade(Long id, EmployeeSkillGradeRequest request) {
        EmployeeSkillGrade esg = employeeSkillGradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee skill grade not found with id: " + id));

        boolean employeeChanged = !esg.getEmployee().getId().equals(request.employeeId());
        boolean skillGradeChanged = !esg.getSkillGrade().getId().equals(request.skillGradeId());

        if ((employeeChanged || skillGradeChanged) &&
                employeeSkillGradeRepository.existsByEmployeeIdAndSkillGradeId(
                        request.employeeId(), request.skillGradeId())) {
            throw new DuplicateResourceException("Employee skill grade already exists for employee id: " +
                    request.employeeId() + " and skill grade id: " + request.skillGradeId());
        }

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.employeeId()));

        SkillGrade skillGrade = skillGradeRepository.findById(request.skillGradeId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill grade not found with id: " + request.skillGradeId()));

        esg.setEmployee(employee);
        esg.setSkillGrade(skillGrade);
        esg.setYearsOfExperience(request.yearsOfExperience());
        esg.setLastUsedDate(request.lastUsedDate());
        esg.setCertified(request.certified() != null ? request.certified() : false);
        esg.setEmployeeComment(request.employeeComment());

        if (request.reviewedByEmployeeId() != null) {
            Employee reviewer = employeeRepository.findById(request.reviewedByEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reviewer employee not found with id: " + request.reviewedByEmployeeId()));
            esg.setReviewedBy(reviewer);
        } else {
            esg.setReviewedBy(null);
        }
        esg.setReviewerComment(request.reviewerComment());

        EmployeeSkillGrade updated = employeeSkillGradeRepository.save(esg);
        return EmployeeSkillGradeResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteEmployeeSkillGrade(Long id) {
        if (!employeeSkillGradeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee skill grade not found with id: " + id);
        }
        employeeSkillGradeRepository.deleteById(id);
    }
}
