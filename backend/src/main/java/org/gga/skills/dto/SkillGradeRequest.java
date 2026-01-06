package org.gga.skills.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SkillGradeRequest(
    @NotNull(message = "Skill ID is required")
    Long skillId,

    @NotBlank(message = "Code is required")
    @Size(max = 50, message = "Code must not exceed 50 characters")
    String code,

    @Size(max = 255, message = "Description must not exceed 255 characters")
    String description
) {}
