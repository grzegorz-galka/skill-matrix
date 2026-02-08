package org.gga.skills.service;

import org.gga.skills.model.Employee;
import org.gga.skills.model.EmployeeSkillProfile;
import org.gga.skills.model.SkillProfile;
import org.gga.skills.repository.EmployeeRepository;
import org.gga.skills.repository.EmployeeSkillProfileRepository;
import org.gga.skills.repository.SkillProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeSkillProfileServiceTest {

    @Mock
    private EmployeeSkillProfileRepository employeeSkillProfileRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private SkillProfileRepository skillProfileRepository;

    @InjectMocks
    private EmployeeSkillProfileService service;

    private Employee employee;
    private SkillProfile skillProfile;

    @BeforeEach
    void setUp() {
        employee = new Employee("John", "Doe", "john@example.com");
        employee.setId(1L);
        skillProfile = new SkillProfile("Java Developer", "Java skills");
        skillProfile.setId(10L);
    }

    // --- ASSIGN TESTS ---

    @Test
    void assignSkillProfile_WhenAlreadyAssigned_ThrowsDuplicateResourceException() {
        when(employeeSkillProfileRepository.existsByEmployeeIdAndSkillProfileId(1L, 10L))
                .thenReturn(true);

        assertThatThrownBy(() -> service.assignSkillProfileToEmployee(1L, 10L))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already has this skill profile");

        // Should fail fast - not even check if employee/profile exist
        verify(employeeRepository, never()).findById(any());
        verify(skillProfileRepository, never()).findById(any());
    }

    @Test
    void assignSkillProfile_WhenEmployeeNotFound_ThrowsResourceNotFoundException() {
        when(employeeSkillProfileRepository.existsByEmployeeIdAndSkillProfileId(1L, 10L))
                .thenReturn(false);
        when(employeeRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.assignSkillProfileToEmployee(1L, 10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Employee not found");
    }

    @Test
    void assignSkillProfile_WhenSkillProfileNotFound_ThrowsResourceNotFoundException() {
        when(employeeSkillProfileRepository.existsByEmployeeIdAndSkillProfileId(1L, 10L))
                .thenReturn(false);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(skillProfileRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.assignSkillProfileToEmployee(1L, 10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Skill profile not found");
    }

    @Test
    void assignSkillProfile_WhenAllValid_SavesAssociation() {
        when(employeeSkillProfileRepository.existsByEmployeeIdAndSkillProfileId(1L, 10L))
                .thenReturn(false);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(skillProfileRepository.findById(10L)).thenReturn(Optional.of(skillProfile));

        service.assignSkillProfileToEmployee(1L, 10L);

        verify(employeeSkillProfileRepository).save(any(EmployeeSkillProfile.class));
    }

    // --- REMOVE TESTS ---

    @Test
    void removeSkillProfile_WhenNotAssigned_ThrowsResourceNotFoundException() {
        when(employeeSkillProfileRepository.existsByEmployeeIdAndSkillProfileId(1L, 10L))
                .thenReturn(false);

        assertThatThrownBy(() -> service.removeSkillProfileFromEmployee(1L, 10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("does not have this skill profile");

        verify(employeeSkillProfileRepository, never()).deleteByEmployeeIdAndSkillProfileId(any(), any());
    }

    @Test
    void removeSkillProfile_WhenAssigned_DeletesSuccessfully() {
        when(employeeSkillProfileRepository.existsByEmployeeIdAndSkillProfileId(1L, 10L))
                .thenReturn(true);

        service.removeSkillProfileFromEmployee(1L, 10L);

        verify(employeeSkillProfileRepository).deleteByEmployeeIdAndSkillProfileId(1L, 10L);
    }

    // --- GET PROFILES TESTS ---

    @Test
    void getSkillProfilesByEmployeeId_WhenEmployeeNotFound_ThrowsResourceNotFoundException() {
        when(employeeRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> service.getSkillProfilesByEmployeeId(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Employee not found");
    }
}
