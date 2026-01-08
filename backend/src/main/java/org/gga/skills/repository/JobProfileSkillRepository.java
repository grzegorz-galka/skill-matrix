package org.gga.skills.repository;

import org.gga.skills.model.JobProfileSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobProfileSkillRepository extends JpaRepository<JobProfileSkill, Long> {

    /**
     * Find all job profile-skill associations for a given job profile.
     *
     * @param jobProfileId the job profile ID
     * @return list of associations
     */
    @Query("SELECT jps FROM JobProfileSkill jps JOIN FETCH jps.skill WHERE jps.jobProfile.id = :jobProfileId")
    List<JobProfileSkill> findByJobProfileId(@Param("jobProfileId") Long jobProfileId);

    /**
     * Find all job profile-skill associations for a given skill.
     *
     * @param skillId the skill ID
     * @return list of associations
     */
    @Query("SELECT jps FROM JobProfileSkill jps JOIN FETCH jps.jobProfile WHERE jps.skill.id = :skillId")
    List<JobProfileSkill> findBySkillId(@Param("skillId") Long skillId);

    /**
     * Check if an association exists between a job profile and a skill.
     *
     * @param jobProfileId the job profile ID
     * @param skillId the skill ID
     * @return true if the association exists, false otherwise
     */
    boolean existsByJobProfileIdAndSkillId(Long jobProfileId, Long skillId);

    /**
     * Delete the association between a job profile and a skill.
     *
     * @param jobProfileId the job profile ID
     * @param skillId the skill ID
     */
    void deleteByJobProfileIdAndSkillId(Long jobProfileId, Long skillId);
}
