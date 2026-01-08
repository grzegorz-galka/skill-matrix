package org.gga.skills.service;

import org.gga.skills.model.JobProfile;
import org.gga.skills.model.JobProfileSkill;
import org.gga.skills.model.Skill;
import org.gga.skills.repository.JobProfileRepository;
import org.gga.skills.repository.JobProfileSkillRepository;
import org.gga.skills.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class JobProfileSkillService {

    private final JobProfileSkillRepository jobProfileSkillRepository;
    private final JobProfileRepository jobProfileRepository;
    private final SkillRepository skillRepository;

    public JobProfileSkillService(JobProfileSkillRepository jobProfileSkillRepository,
                                  JobProfileRepository jobProfileRepository,
                                  SkillRepository skillRepository) {
        this.jobProfileSkillRepository = jobProfileSkillRepository;
        this.jobProfileRepository = jobProfileRepository;
        this.skillRepository = skillRepository;
    }

    /**
     * Get all skills associated with a job profile.
     *
     * @param jobProfileId the job profile ID
     * @return list of skills
     */
    public List<Skill> getSkillsByJobProfileId(Long jobProfileId) {
        return jobProfileSkillRepository.findByJobProfileId(jobProfileId)
                .stream()
                .map(JobProfileSkill::getSkill)
                .toList();
    }

    /**
     * Get all job profiles associated with a skill.
     *
     * @param skillId the skill ID
     * @return list of job profiles
     */
    public List<JobProfile> getJobProfilesBySkillId(Long skillId) {
        return jobProfileSkillRepository.findBySkillId(skillId)
                .stream()
                .map(JobProfileSkill::getJobProfile)
                .toList();
    }

    /**
     * Associate a skill with a job profile.
     *
     * @param skillId the skill ID
     * @param jobProfileId the job profile ID
     * @throws ResourceNotFoundException if skill or job profile doesn't exist
     * @throws DuplicateResourceException if association already exists
     */
    @Transactional
    public void associateSkillWithJobProfile(Long skillId, Long jobProfileId) {
        // Validate that job profile exists
        JobProfile jobProfile = jobProfileRepository.findById(jobProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Job profile not found with id: " + jobProfileId));

        // Validate that skill exists
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + skillId));

        // Check if association already exists
        if (jobProfileSkillRepository.existsByJobProfileIdAndSkillId(jobProfileId, skillId)) {
            throw new DuplicateResourceException("Skill is already associated with this job profile");
        }

        // Create and save the association
        JobProfileSkill association = new JobProfileSkill(jobProfile, skill);
        jobProfileSkillRepository.save(association);
    }

    /**
     * Remove the association between a skill and a job profile.
     *
     * @param skillId the skill ID
     * @param jobProfileId the job profile ID
     * @throws ResourceNotFoundException if the association doesn't exist
     */
    @Transactional
    public void removeAssociation(Long skillId, Long jobProfileId) {
        // Check if association exists
        if (!jobProfileSkillRepository.existsByJobProfileIdAndSkillId(jobProfileId, skillId)) {
            throw new ResourceNotFoundException("Association not found between skill " + skillId + " and job profile " + jobProfileId);
        }

        // Delete the association
        jobProfileSkillRepository.deleteByJobProfileIdAndSkillId(jobProfileId, skillId);
    }
}
