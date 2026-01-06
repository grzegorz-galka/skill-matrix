package org.gga.skills.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.gga.skills.dto.EmployeeSkillGradeRequest;
import org.gga.skills.dto.EmployeeSkillGradeResponse;
import org.gga.skills.service.EmployeeSkillGradeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee-skill-grades")
@Tag(name = "Employee Skill Grades", description = "Employee skill grade management APIs")
public class EmployeeSkillGradeController {

    private final EmployeeSkillGradeService employeeSkillGradeService;

    public EmployeeSkillGradeController(EmployeeSkillGradeService employeeSkillGradeService) {
        this.employeeSkillGradeService = employeeSkillGradeService;
    }

    @GetMapping
    @Operation(summary = "Get all employee skill grades", description = "Retrieve employee skill grades with optional filtering")
    public List<EmployeeSkillGradeResponse> getAllEmployeeSkillGrades(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long skillGradeId,
            @RequestParam(required = false) Boolean paginated,
            Pageable pageable) {

        if (employeeId != null) {
            return employeeSkillGradeService.getEmployeeSkillGradesByEmployeeId(employeeId);
        }
        if (skillGradeId != null) {
            return employeeSkillGradeService.getEmployeeSkillGradesBySkillGradeId(skillGradeId);
        }
        if (Boolean.TRUE.equals(paginated)) {
            return employeeSkillGradeService.getAllEmployeeSkillGrades(pageable).getContent();
        }
        return employeeSkillGradeService.getAllEmployeeSkillGrades(Pageable.unpaged()).getContent();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee skill grade by ID", description = "Retrieve a single employee skill grade by its ID")
    public EmployeeSkillGradeResponse getEmployeeSkillGradeById(@PathVariable Long id) {
        return employeeSkillGradeService.getEmployeeSkillGradeById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new employee skill grade", description = "Assign a skill grade to an employee with assessment details")
    public EmployeeSkillGradeResponse createEmployeeSkillGrade(@Valid @RequestBody EmployeeSkillGradeRequest request) {
        return employeeSkillGradeService.createEmployeeSkillGrade(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an employee skill grade", description = "Update an existing employee skill grade")
    public EmployeeSkillGradeResponse updateEmployeeSkillGrade(@PathVariable Long id,
                                                                 @Valid @RequestBody EmployeeSkillGradeRequest request) {
        return employeeSkillGradeService.updateEmployeeSkillGrade(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an employee skill grade", description = "Delete an employee skill grade by its ID")
    public void deleteEmployeeSkillGrade(@PathVariable Long id) {
        employeeSkillGradeService.deleteEmployeeSkillGrade(id);
    }
}
