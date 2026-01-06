package org.gga.skills.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "employee_skill_grade", uniqueConstraints = {
    @UniqueConstraint(name = "uk_employee_skill_grade", columnNames = {"employee_id", "skill_grade_id"})
})
public class EmployeeSkillGrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_grade_id", nullable = false)
    private SkillGrade skillGrade;

    @Min(0)
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "last_used_date")
    private LocalDate lastUsedDate;

    @NotNull
    @Column(name = "certified", nullable = false)
    private Boolean certified = false;

    @Column(name = "employee_comment", columnDefinition = "TEXT")
    private String employeeComment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_employee_id")
    private Employee reviewedBy;

    @Column(name = "reviewer_comment", columnDefinition = "TEXT")
    private String reviewerComment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (certified == null) {
            certified = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public EmployeeSkillGrade() {
    }

    public EmployeeSkillGrade(Employee employee, SkillGrade skillGrade) {
        this.employee = employee;
        this.skillGrade = skillGrade;
        this.certified = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public SkillGrade getSkillGrade() {
        return skillGrade;
    }

    public void setSkillGrade(SkillGrade skillGrade) {
        this.skillGrade = skillGrade;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public LocalDate getLastUsedDate() {
        return lastUsedDate;
    }

    public void setLastUsedDate(LocalDate lastUsedDate) {
        this.lastUsedDate = lastUsedDate;
    }

    public Boolean getCertified() {
        return certified;
    }

    public void setCertified(Boolean certified) {
        this.certified = certified;
    }

    public String getEmployeeComment() {
        return employeeComment;
    }

    public void setEmployeeComment(String employeeComment) {
        this.employeeComment = employeeComment;
    }

    public Employee getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(Employee reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public String getReviewerComment() {
        return reviewerComment;
    }

    public void setReviewerComment(String reviewerComment) {
        this.reviewerComment = reviewerComment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EmployeeSkillGrade that = (EmployeeSkillGrade) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "EmployeeSkillGrade{" +
                "id=" + id +
                ", employeeId=" + (employee != null ? employee.getId() : null) +
                ", skillGradeId=" + (skillGrade != null ? skillGrade.getId() : null) +
                ", yearsOfExperience=" + yearsOfExperience +
                ", certified=" + certified +
                '}';
    }
}
