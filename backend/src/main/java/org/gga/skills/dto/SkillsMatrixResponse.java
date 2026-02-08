package org.gga.skills.dto;

import java.util.List;
import java.util.Map;

public record SkillsMatrixResponse(
    List<MatrixEmployee> employees,
    List<MatrixSkill> skills,
    Map<String, MatrixCell> cells,
    Map<Long, SkillSummary> skillSummaries
) {
    public record MatrixEmployee(
        Long id,
        String firstName,
        String lastName,
        String email,
        String department,
        String position
    ) {}

    public record MatrixSkill(
        Long id,
        String name,
        List<String> skillProfileNames
    ) {}

    public record MatrixCell(
        Long employeeId,
        Long skillId,
        Long skillGradeId,
        String gradeCode,
        String gradeDescription,
        Integer level,
        Integer yearsOfExperience,
        Boolean certified
    ) {}

    public record SkillSummary(
        Long skillId,
        Map<String, Long> gradeCounts
    ) {}

    public static String cellKey(Long employeeId, Long skillId) {
        return employeeId + "_" + skillId;
    }
}
