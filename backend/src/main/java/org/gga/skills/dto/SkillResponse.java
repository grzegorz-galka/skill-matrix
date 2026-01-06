package org.gga.skills.dto;

import org.gga.skills.model.Skill;

import java.time.LocalDateTime;

public record SkillResponse(
    Long id,
    String name,
    Long skillProfileId,
    String skillProfileName,
    String description,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static SkillResponse fromEntity(Skill skill) {
        return new SkillResponse(
            skill.getId(),
            skill.getName(),
            skill.getSkillProfile().getId(),
            skill.getSkillProfile().getName(),
            skill.getDescription(),
            skill.getCreatedAt(),
            skill.getUpdatedAt()
        );
    }
}
