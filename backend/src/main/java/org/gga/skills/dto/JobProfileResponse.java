package org.gga.skills.dto;

import org.gga.skills.model.JobProfile;

import java.time.LocalDateTime;

public record JobProfileResponse(
    Long id,
    String name,
    String description,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static JobProfileResponse fromEntity(JobProfile jobProfile) {
        return new JobProfileResponse(
            jobProfile.getId(),
            jobProfile.getName(),
            jobProfile.getDescription(),
            jobProfile.getCreatedAt(),
            jobProfile.getUpdatedAt()
        );
    }
}
