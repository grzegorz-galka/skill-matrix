package org.gga.skills.dto;

import org.gga.skills.model.SkillProfile;

import java.time.LocalDateTime;

public record SkillProfileResponse(
    Long id,
    String name,
    String description,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static SkillProfileResponse fromEntity(SkillProfile skillProfile) {
        return new SkillProfileResponse(
            skillProfile.getId(),
            skillProfile.getName(),
            skillProfile.getDescription(),
            skillProfile.getCreatedAt(),
            skillProfile.getUpdatedAt()
        );
    }
}
