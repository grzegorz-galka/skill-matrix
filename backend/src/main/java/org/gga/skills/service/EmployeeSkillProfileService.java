package org.gga.skills.service;

import org.gga.skills.dto.CurrentUser;
import org.gga.skills.dto.SkillProfileResponse;
import org.gga.skills.model.Employee;
import org.gga.skills.model.EmployeeSkillProfile;
import org.gga.skills.model.Role;
import org.gga.skills.model.SkillProfile;
import org.gga.skills.repository.EmployeeRepository;
import org.gga.skills.repository.EmployeeSkillProfileRepository;
import org.gga.skills.repository.SkillProfileRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class EmployeeSkillProfileService {

    private final EmployeeSkillProfileRepository employeeSkillProfileRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillProfileRepository skillProfileRepository;
    private final CurrentUserService currentUserService;

    public EmployeeSkillProfileService(EmployeeSkillProfileRepository employeeSkillProfileRepository,
                                       EmployeeRepository employeeRepository,
                                       SkillProfileRepository skillProfileRepository,
                                       CurrentUserService currentUserService) {
        this.employeeSkillProfileRepository = employeeSkillProfileRepository;
        this.employeeRepository = employeeRepository;
        this.skillProfileRepository = skillProfileRepository;
        this.currentUserService = currentUserService;
    }

    private void requireAdmin() {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        if (currentUser.role() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can manage employee skill profile assignments");
        }
    }

    public List<SkillProfileResponse> getSkillProfilesByEmployeeId(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found with id: " + employeeId);
        }
        return employeeSkillProfileRepository.findByEmployeeId(employeeId).stream()
                .map(esp -> SkillProfileResponse.fromEntity(esp.getSkillProfile()))
                .toList();
    }

    @Transactional
    public void assignSkillProfileToEmployee(Long employeeId, Long skillProfileId) {
        requireAdmin();
        if (employeeSkillProfileRepository.existsByEmployeeIdAndSkillProfileId(employeeId, skillProfileId)) {
            throw new DuplicateResourceException("Employee already has this skill profile assigned");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        SkillProfile skillProfile = skillProfileRepository.findById(skillProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill profile not found with id: " + skillProfileId));

        EmployeeSkillProfile esp = new EmployeeSkillProfile(employee, skillProfile);
        employeeSkillProfileRepository.save(esp);
    }

    @Transactional
    public void removeSkillProfileFromEmployee(Long employeeId, Long skillProfileId) {
        requireAdmin();
        if (!employeeSkillProfileRepository.existsByEmployeeIdAndSkillProfileId(employeeId, skillProfileId)) {
            throw new ResourceNotFoundException("Employee does not have this skill profile assigned");
        }
        employeeSkillProfileRepository.deleteByEmployeeIdAndSkillProfileId(employeeId, skillProfileId);
    }
}
