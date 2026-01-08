package org.gga.skills.dto;

import org.gga.skills.model.JobProfile;
import org.gga.skills.model.Skill;

import java.time.LocalDateTime;
import java.util.List;

public record SkillResponse(
    Long id,
    String name,
    List<JobProfileResponse> jobProfiles,
    String description,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static SkillResponse fromEntity(Skill skill, List<JobProfile> jobProfiles) {
        return new SkillResponse(
            skill.getId(),
            skill.getName(),
            jobProfiles.stream().map(JobProfileResponse::fromEntity).toList(),
            skill.getDescription(),
            skill.getCreatedAt(),
            skill.getUpdatedAt()
        );
    }
}
