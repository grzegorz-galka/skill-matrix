package org.gga.skills.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "employee_skill_profile", uniqueConstraints = {
    @UniqueConstraint(name = "uk_employee_skill_profile", columnNames = {"employee_id", "skill_profile_id"})
})
public class EmployeeSkillProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_profile_id", nullable = false)
    private SkillProfile skillProfile;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public EmployeeSkillProfile() {
    }

    public EmployeeSkillProfile(Employee employee, SkillProfile skillProfile) {
        this.employee = employee;
        this.skillProfile = skillProfile;
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

    public SkillProfile getSkillProfile() {
        return skillProfile;
    }

    public void setSkillProfile(SkillProfile skillProfile) {
        this.skillProfile = skillProfile;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EmployeeSkillProfile that = (EmployeeSkillProfile) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "EmployeeSkillProfile{" +
                "id=" + id +
                ", employeeId=" + (employee != null ? employee.getId() : null) +
                ", skillProfileId=" + (skillProfile != null ? skillProfile.getId() : null) +
                '}';
    }
}
