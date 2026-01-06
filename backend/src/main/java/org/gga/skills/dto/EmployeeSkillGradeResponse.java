package org.gga.skills.dto;

import org.gga.skills.model.EmployeeSkillGrade;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EmployeeSkillGradeResponse(
    Long id,
    Long employeeId,
    String employeeFullName,
    Long skillGradeId,
    String skillGradeCode,
    Long skillId,
    String skillName,
    Integer yearsOfExperience,
    LocalDate lastUsedDate,
    Boolean certified,
    String employeeComment,
    Long reviewedByEmployeeId,
    String reviewedByEmployeeName,
    String reviewerComment,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static EmployeeSkillGradeResponse fromEntity(EmployeeSkillGrade esg) {
        return new EmployeeSkillGradeResponse(
            esg.getId(),
            esg.getEmployee().getId(),
            esg.getEmployee().getFirstName() + " " + esg.getEmployee().getLastName(),
            esg.getSkillGrade().getId(),
            esg.getSkillGrade().getCode(),
            esg.getSkillGrade().getSkill().getId(),
            esg.getSkillGrade().getSkill().getName(),
            esg.getYearsOfExperience(),
            esg.getLastUsedDate(),
            esg.getCertified(),
            esg.getEmployeeComment(),
            esg.getReviewedBy() != null ? esg.getReviewedBy().getId() : null,
            esg.getReviewedBy() != null ?
                esg.getReviewedBy().getFirstName() + " " + esg.getReviewedBy().getLastName() : null,
            esg.getReviewerComment(),
            esg.getCreatedAt(),
            esg.getUpdatedAt()
        );
    }
}
