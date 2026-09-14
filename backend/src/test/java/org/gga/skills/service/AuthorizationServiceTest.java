package org.gga.skills.service;

import org.gga.skills.config.AuthorizationConfig.AuthorizationProperties;
import org.gga.skills.config.AuthorizationConfig.ReviewerConfig;
import org.gga.skills.config.AuthorizationConfig.ReviewerPermissions;
import org.gga.skills.model.*;
import org.gga.skills.repository.EmployeeRepository;
import org.gga.skills.repository.EmployeeSkillProfileRepository;
import org.gga.skills.repository.SkillGradeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private SkillGradeRepository skillGradeRepository;
    @Mock
    private EmployeeSkillProfileRepository employeeSkillProfileRepository;

    private AuthorizationService authorizationService;

    private Employee targetEmployee;

    @BeforeEach
    void setUp() {
        ReviewerPermissions permissions = new ReviewerPermissions(
                List.of("CKI-P", "CKI-IT*"),
                List.of("Analyst"),
                List.of("*Java*"),
                List.of("*galka*")
        );
        ReviewerConfig reviewer = new ReviewerConfig("reviewer@company.com", permissions);
        AuthorizationProperties props = new AuthorizationProperties(
                List.of("admin@company.com"),
                List.of(reviewer)
        );

        authorizationService = new AuthorizationService(props, employeeRepository, skillGradeRepository, employeeSkillProfileRepository);

        targetEmployee = new Employee("Anna", "Galka", "anna.galka@company.com");
        targetEmployee.setId(1L);
        targetEmployee.setDepartment("CKI-P");
    }

    @Test
    void resolveRole_ForAdmin_ReturnsAdmin() {
        assertThat(authorizationService.resolveRole("admin@company.com")).isEqualTo(Role.ADMIN);
    }

    @Test
    void resolveRole_ForAdmin_CaseInsensitive() {
        assertThat(authorizationService.resolveRole("ADMIN@company.com")).isEqualTo(Role.ADMIN);
    }

    @Test
    void resolveRole_ForReviewer_ReturnsReviewer() {
        assertThat(authorizationService.resolveRole("reviewer@company.com")).isEqualTo(Role.REVIEWER);
    }

    @Test
    void resolveRole_ForRegularUser_ReturnsEmployee() {
        assertThat(authorizationService.resolveRole("user@company.com")).isEqualTo(Role.EMPLOYEE);
    }

    @Test
    void canEditEmployee_AdminCanEditAnyone() {
        assertThat(authorizationService.canEditEmployee("admin@company.com", 1L)).isTrue();
    }

    @Test
    void canEditEmployee_EmployeeCanEditSelf() {
        Employee self = new Employee("Self", "User", "self@company.com");
        self.setId(5L);
        when(employeeRepository.findByEmail("self@company.com")).thenReturn(Optional.of(self));

        assertThat(authorizationService.canEditEmployee("self@company.com", 5L)).isTrue();
    }

    @Test
    void canEditEmployee_EmployeeCannotEditOthers() {
        Employee self = new Employee("Self", "User", "self@company.com");
        self.setId(5L);
        when(employeeRepository.findByEmail("self@company.com")).thenReturn(Optional.of(self));

        assertThat(authorizationService.canEditEmployee("self@company.com", 1L)).isFalse();
    }

    @Test
    void canEditEmployeeSkillGrade_ReviewerMatchesDepartmentPattern() {
        when(employeeRepository.findByEmail("reviewer@company.com")).thenReturn(Optional.empty());
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(targetEmployee));

        assertThat(authorizationService.canEditEmployeeSkillGrade("reviewer@company.com", 1L, null)).isTrue();
    }

    @Test
    void canEditEmployeeSkillGrade_ReviewerMatchesEmailPattern() {
        Employee employee = new Employee("Anna", "Galka", "anna.galka@company.com");
        employee.setId(2L);
        employee.setDepartment("OTHER");

        when(employeeRepository.findByEmail("reviewer@company.com")).thenReturn(Optional.empty());
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));

        assertThat(authorizationService.canEditEmployeeSkillGrade("reviewer@company.com", 2L, null)).isTrue();
    }

    @Test
    void canEditEmployeeSkillGrade_ReviewerNoMatch() {
        Employee employee = new Employee("John", "Smith", "john.smith@company.com");
        employee.setId(3L);
        employee.setDepartment("HR");

        Skill skill = new Skill("Python");
        skill.setId(10L);
        SkillGrade skillGrade = new SkillGrade();
        skillGrade.setId(100L);
        skillGrade.setSkill(skill);

        when(employeeRepository.findByEmail("reviewer@company.com")).thenReturn(Optional.empty());
        when(employeeRepository.findById(3L)).thenReturn(Optional.of(employee));
        when(employeeSkillProfileRepository.findByEmployeeId(3L)).thenReturn(List.of());
        when(skillGradeRepository.findById(100L)).thenReturn(Optional.of(skillGrade));

        assertThat(authorizationService.canEditEmployeeSkillGrade("reviewer@company.com", 3L, 100L)).isFalse();
    }

    @Test
    void canEditEmployeeSkillGrade_ReviewerMatchesSkillPattern() {
        Employee employee = new Employee("John", "Smith", "john.smith@company.com");
        employee.setId(3L);
        employee.setDepartment("HR");

        Skill skill = new Skill("Advanced Java");
        skill.setId(10L);
        SkillGrade skillGrade = new SkillGrade();
        skillGrade.setId(100L);
        skillGrade.setSkill(skill);

        when(employeeRepository.findByEmail("reviewer@company.com")).thenReturn(Optional.empty());
        when(employeeRepository.findById(3L)).thenReturn(Optional.of(employee));
        when(employeeSkillProfileRepository.findByEmployeeId(3L)).thenReturn(List.of());
        when(skillGradeRepository.findById(100L)).thenReturn(Optional.of(skillGrade));

        assertThat(authorizationService.canEditEmployeeSkillGrade("reviewer@company.com", 3L, 100L)).isTrue();
    }
}
