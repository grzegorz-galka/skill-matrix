package org.gga.skills.dto;

import org.gga.skills.model.SkillGrade;

import java.time.LocalDateTime;

public record SkillGradeResponse(
    Long id,
    Long skillId,
    String skillName,
    String code,
    String description,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static SkillGradeResponse fromEntity(SkillGrade skillGrade) {
        return new SkillGradeResponse(
            skillGrade.getId(),
            skillGrade.getSkill().getId(),
            skillGrade.getSkill().getName(),
            skillGrade.getCode(),
            skillGrade.getDescription(),
            skillGrade.getCreatedAt(),
            skillGrade.getUpdatedAt()
        );
    }
}
