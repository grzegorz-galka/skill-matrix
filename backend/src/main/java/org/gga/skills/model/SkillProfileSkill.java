package org.gga.skills.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "skill_profile_skill", uniqueConstraints = {
    @UniqueConstraint(name = "uk_skill_profile_skill", columnNames = {"skill_profile_id", "skill_id"})
})
public class SkillProfileSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_profile_id", nullable = false)
    private SkillProfile skillProfile;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public SkillProfileSkill() {
    }

    public SkillProfileSkill(SkillProfile skillProfile, Skill skill) {
        this.skillProfile = skillProfile;
        this.skill = skill;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SkillProfile getSkillProfile() {
        return skillProfile;
    }

    public void setSkillProfile(SkillProfile skillProfile) {
        this.skillProfile = skillProfile;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SkillProfileSkill that = (SkillProfileSkill) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "SkillProfileSkill{" +
                "id=" + id +
                ", skillProfileId=" + (skillProfile != null ? skillProfile.getId() : null) +
                ", skillId=" + (skill != null ? skill.getId() : null) +
                '}';
    }
}
