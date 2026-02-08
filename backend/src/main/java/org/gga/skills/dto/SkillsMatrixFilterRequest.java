package org.gga.skills.dto;

import java.util.List;

public record SkillsMatrixFilterRequest(
    List<String> namePatterns,
    List<String> departmentPatterns,
    List<String> positionPatterns,
    List<String> skillNamePatterns,
    List<String> skillProfilePatterns
) {
    public SkillsMatrixFilterRequest {
        namePatterns = namePatterns != null ? namePatterns : List.of();
        departmentPatterns = departmentPatterns != null ? departmentPatterns : List.of();
        positionPatterns = positionPatterns != null ? positionPatterns : List.of();
        skillNamePatterns = skillNamePatterns != null ? skillNamePatterns : List.of();
        skillProfilePatterns = skillProfilePatterns != null ? skillProfilePatterns : List.of();
    }
}
