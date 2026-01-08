package org.gga.skills.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.gga.skills.dto.EmployeeRequest;
import org.gga.skills.dto.EmployeeResponse;
import org.gga.skills.dto.JobProfileResponse;
import org.gga.skills.service.EmployeeService;
import org.gga.skills.service.EmployeeJobProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@Tag(name = "Employees", description = "Employee management APIs")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeJobProfileService employeeJobProfileService;

    public EmployeeController(EmployeeService employeeService,
                               EmployeeJobProfileService employeeJobProfileService) {
        this.employeeService = employeeService;
        this.employeeJobProfileService = employeeJobProfileService;
    }

    @GetMapping
    @Operation(summary = "Get all employees or search", description = "Retrieve a paginated list of all employees, or search by name/email if search parameter is provided")
    public Page<EmployeeResponse> getAllEmployees(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return employeeService.searchEmployees(search, pageable);
        }
        return employeeService.getAllEmployees(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID", description = "Retrieve a single employee by their ID")
    public EmployeeResponse getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new employee", description = "Create a new employee record")
    public EmployeeResponse createEmployee(@Valid @RequestBody EmployeeRequest request) {
        return employeeService.createEmployee(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an employee", description = "Update an existing employee record")
    public EmployeeResponse updateEmployee(@PathVariable Long id,
                                            @Valid @RequestBody EmployeeRequest request) {
        return employeeService.updateEmployee(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an employee", description = "Delete an employee by their ID")
    public void deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
    }

    @GetMapping("/{id}/job-profiles")
    @Operation(summary = "Get employee's job profiles", description = "Get all job profiles assigned to an employee")
    public List<JobProfileResponse> getEmployeeJobProfiles(@PathVariable Long id) {
        return employeeJobProfileService.getJobProfilesByEmployeeId(id);
    }

    @PostMapping("/{employeeId}/job-profiles/{jobProfileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Assign job profile to employee", description = "Assign a job profile to an employee")
    public void assignJobProfile(@PathVariable Long employeeId, @PathVariable Long jobProfileId) {
        employeeJobProfileService.assignJobProfileToEmployee(employeeId, jobProfileId);
    }

    @DeleteMapping("/{employeeId}/job-profiles/{jobProfileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove job profile from employee", description = "Remove a job profile assignment from an employee")
    public void removeJobProfile(@PathVariable Long employeeId, @PathVariable Long jobProfileId) {
        employeeJobProfileService.removeJobProfileFromEmployee(employeeId, jobProfileId);
    }
}
