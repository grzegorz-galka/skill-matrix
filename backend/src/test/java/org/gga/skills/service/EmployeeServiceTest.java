package org.gga.skills.service;

import org.gga.skills.dto.EmployeeRequest;
import org.gga.skills.dto.EmployeeResponse;
import org.gga.skills.model.Employee;
import org.gga.skills.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeService employeeService;

    private Employee employee;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        employee = new Employee("John", "Doe", "john@example.com");
        employee.setId(1L);
        pageable = PageRequest.of(0, 20);
    }

    // --- SEARCH TESTS ---

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   ", "\t", "\n"})
    void searchEmployees_WithNullOrBlankTerm_FallsBackToGetAll(String searchTerm) {
        Page<Employee> page = new PageImpl<>(List.of(employee));
        when(employeeRepository.findAll(pageable)).thenReturn(page);

        employeeService.searchEmployees(searchTerm, pageable);

        verify(employeeRepository).findAll(pageable);
        verify(employeeRepository, never()).searchEmployees(any(), any());
    }

    @Test
    void searchEmployees_WithValidTerm_TrimsAndSearches() {
        Page<Employee> page = new PageImpl<>(List.of(employee));
        when(employeeRepository.searchEmployees(eq("john"), eq(pageable))).thenReturn(page);

        employeeService.searchEmployees("  john  ", pageable);

        verify(employeeRepository).searchEmployees("john", pageable);
    }

    @Test
    void searchEmployees_WithValidTerm_ReturnsResults() {
        Page<Employee> page = new PageImpl<>(List.of(employee));
        when(employeeRepository.searchEmployees(eq("john"), eq(pageable))).thenReturn(page);

        Page<EmployeeResponse> result = employeeService.searchEmployees("john", pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).firstName()).isEqualTo("John");
    }

    // --- CREATE TESTS ---

    @Test
    void createEmployee_WithDuplicateEmail_ThrowsDuplicateResourceException() {
        EmployeeRequest request = new EmployeeRequest("Jane", "Doe", "john@example.com", null, null);
        when(employeeRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> employeeService.createEmployee(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("john@example.com");

        verify(employeeRepository, never()).save(any());
    }

    @Test
    void createEmployee_WithUniqueEmail_CreatesSuccessfully() {
        EmployeeRequest request = new EmployeeRequest("Jane", "Doe", "jane@example.com", "IT", "Developer");
        Employee saved = new Employee("Jane", "Doe", "jane@example.com");
        saved.setId(2L);

        when(employeeRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenReturn(saved);

        EmployeeResponse response = employeeService.createEmployee(request);

        assertThat(response.firstName()).isEqualTo("Jane");
        verify(employeeRepository).save(any(Employee.class));
    }

    // --- UPDATE TESTS ---

    @Test
    void updateEmployee_WhenEmailUnchanged_SkipsDuplicateCheck() {
        EmployeeRequest request = new EmployeeRequest("John", "Smith", "john@example.com", "IT", "Dev");

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        employeeService.updateEmployee(1L, request);

        verify(employeeRepository, never()).existsByEmail(any());
    }

    @Test
    void updateEmployee_WhenEmailChangedToExisting_ThrowsDuplicateResourceException() {
        EmployeeRequest request = new EmployeeRequest("John", "Doe", "jane@example.com", null, null);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.existsByEmail("jane@example.com")).thenReturn(true);

        assertThatThrownBy(() -> employeeService.updateEmployee(1L, request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(employeeRepository, never()).save(any());
    }

    @Test
    void updateEmployee_WhenEmailChangedToUnique_UpdatesSuccessfully() {
        EmployeeRequest request = new EmployeeRequest("John", "Doe", "newemail@example.com", null, null);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.existsByEmail("newemail@example.com")).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        employeeService.updateEmployee(1L, request);

        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void updateEmployee_WhenNotFound_ThrowsResourceNotFoundException() {
        EmployeeRequest request = new EmployeeRequest("John", "Doe", "john@example.com", null, null);
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.updateEmployee(999L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- GET TESTS ---

    @Test
    void getEmployeeById_WhenNotFound_ThrowsResourceNotFoundException() {
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.getEmployeeById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void getEmployeeById_WhenFound_ReturnsResponse() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        EmployeeResponse response = employeeService.getEmployeeById(1L);

        assertThat(response.firstName()).isEqualTo("John");
        assertThat(response.email()).isEqualTo("john@example.com");
    }

    @Test
    void getEmployeeByEmail_WhenNotFound_ThrowsResourceNotFoundException() {
        when(employeeRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.getEmployeeByEmail("unknown@example.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("unknown@example.com");
    }

    // --- DELETE TESTS ---

    @Test
    void deleteEmployee_WhenNotFound_ThrowsResourceNotFoundException() {
        when(employeeRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> employeeService.deleteEmployee(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(employeeRepository, never()).deleteById(any());
    }

    @Test
    void deleteEmployee_WhenExists_DeletesSuccessfully() {
        when(employeeRepository.existsById(1L)).thenReturn(true);

        employeeService.deleteEmployee(1L);

        verify(employeeRepository).deleteById(1L);
    }
}
