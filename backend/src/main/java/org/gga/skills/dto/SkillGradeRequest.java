package org.gga.skills.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
    String description,

    @Min(value = 1, message = "Level must be between 1 and 5")
    @Max(value = 5, message = "Level must be between 1 and 5")
    Integer level
) {
    public SkillGradeRequest {
        if (level == null) {
            level = 1;
        }
    }
}
