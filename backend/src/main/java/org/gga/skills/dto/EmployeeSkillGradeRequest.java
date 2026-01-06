package org.gga.skills.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record EmployeeSkillGradeRequest(
    @NotNull(message = "Employee ID is required")
    Long employeeId,

    @NotNull(message = "Skill grade ID is required")
    Long skillGradeId,

    @Min(value = 0, message = "Years of experience must be non-negative")
    Integer yearsOfExperience,

    LocalDate lastUsedDate,

    Boolean certified,

    String employeeComment,

    Long reviewedByEmployeeId,

    String reviewerComment
) {}
