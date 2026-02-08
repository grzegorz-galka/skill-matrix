package org.gga.skills.dto;

import org.gga.skills.model.SkillProfile;
import org.gga.skills.model.Skill;
import org.gga.skills.model.SkillGrade;

import java.time.LocalDateTime;
import java.util.List;

public record SkillResponse(
    Long id,
    String name,
    List<SkillProfileResponse> skillProfiles,
    List<SkillGradeResponse> grades,
    String description,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static SkillResponse fromEntity(Skill skill, List<SkillProfile> skillProfiles, List<SkillGrade> grades) {
        return new SkillResponse(
            skill.getId(),
            skill.getName(),
            skillProfiles.stream().map(SkillProfileResponse::fromEntity).toList(),
            grades.stream().map(SkillGradeResponse::fromEntity).toList(),
            skill.getDescription(),
            skill.getCreatedAt(),
            skill.getUpdatedAt()
        );
    }
}
