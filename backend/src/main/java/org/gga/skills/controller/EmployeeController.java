package org.gga.skills.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.gga.skills.dto.EmployeeRequest;
import org.gga.skills.dto.EmployeeResponse;
import org.gga.skills.dto.SkillProfileResponse;
import org.gga.skills.service.EmployeeService;
import org.gga.skills.service.EmployeeSkillProfileService;
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
    private final EmployeeSkillProfileService employeeSkillProfileService;

    public EmployeeController(EmployeeService employeeService,
                               EmployeeSkillProfileService employeeSkillProfileService) {
        this.employeeService = employeeService;
        this.employeeSkillProfileService = employeeSkillProfileService;
    }

    @GetMapping
    @Operation(summary = "Get all employees", description = "Retrieve a paginated list of all employees")
    public Page<EmployeeResponse> getAllEmployees(Pageable pageable) {
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

    @GetMapping("/{id}/skill-profiles")
    @Operation(summary = "Get employee's skill profiles", description = "Get all skill profiles assigned to an employee")
    public List<SkillProfileResponse> getEmployeeSkillProfiles(@PathVariable Long id) {
        return employeeSkillProfileService.getSkillProfilesByEmployeeId(id);
    }

    @PostMapping("/{employeeId}/skill-profiles/{skillProfileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Assign skill profile to employee", description = "Assign a skill profile to an employee")
    public void assignSkillProfile(@PathVariable Long employeeId, @PathVariable Long skillProfileId) {
        employeeSkillProfileService.assignSkillProfileToEmployee(employeeId, skillProfileId);
    }

    @DeleteMapping("/{employeeId}/skill-profiles/{skillProfileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove skill profile from employee", description = "Remove a skill profile assignment from an employee")
    public void removeSkillProfile(@PathVariable Long employeeId, @PathVariable Long skillProfileId) {
        employeeSkillProfileService.removeSkillProfileFromEmployee(employeeId, skillProfileId);
    }
}
