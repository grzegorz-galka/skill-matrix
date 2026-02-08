package org.gga.skills.repository;

import org.gga.skills.model.SkillProfileSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillProfileSkillRepository extends JpaRepository<SkillProfileSkill, Long> {

    /**
     * Find all skill profile-skill associations for a given skill profile.
     *
     * @param skillProfileId the skill profile ID
     * @return list of associations
     */
    @Query("SELECT sps FROM SkillProfileSkill sps JOIN FETCH sps.skill WHERE sps.skillProfile.id = :skillProfileId")
    List<SkillProfileSkill> findBySkillProfileId(@Param("skillProfileId") Long skillProfileId);

    /**
     * Find all skill profile-skill associations for a given skill.
     *
     * @param skillId the skill ID
     * @return list of associations
     */
    @Query("SELECT sps FROM SkillProfileSkill sps JOIN FETCH sps.skillProfile WHERE sps.skill.id = :skillId")
    List<SkillProfileSkill> findBySkillId(@Param("skillId") Long skillId);

    /**
     * Check if an association exists between a skill profile and a skill.
     *
     * @param skillProfileId the skill profile ID
     * @param skillId the skill ID
     * @return true if the association exists, false otherwise
     */
    boolean existsBySkillProfileIdAndSkillId(Long skillProfileId, Long skillId);

    /**
     * Delete the association between a skill profile and a skill.
     *
     * @param skillProfileId the skill profile ID
     * @param skillId the skill ID
     */
    void deleteBySkillProfileIdAndSkillId(Long skillProfileId, Long skillId);
}
