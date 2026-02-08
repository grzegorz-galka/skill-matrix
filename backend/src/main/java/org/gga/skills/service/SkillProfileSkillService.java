package org.gga.skills.service;

import org.gga.skills.model.SkillProfile;
import org.gga.skills.model.SkillProfileSkill;
import org.gga.skills.model.Skill;
import org.gga.skills.repository.SkillProfileRepository;
import org.gga.skills.repository.SkillProfileSkillRepository;
import org.gga.skills.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class SkillProfileSkillService {

    private final SkillProfileSkillRepository skillProfileSkillRepository;
    private final SkillProfileRepository skillProfileRepository;
    private final SkillRepository skillRepository;

    public SkillProfileSkillService(SkillProfileSkillRepository skillProfileSkillRepository,
                                    SkillProfileRepository skillProfileRepository,
                                    SkillRepository skillRepository) {
        this.skillProfileSkillRepository = skillProfileSkillRepository;
        this.skillProfileRepository = skillProfileRepository;
        this.skillRepository = skillRepository;
    }

    /**
     * Get all skills associated with a skill profile.
     *
     * @param skillProfileId the skill profile ID
     * @return list of skills
     */
    public List<Skill> getSkillsBySkillProfileId(Long skillProfileId) {
        return skillProfileSkillRepository.findBySkillProfileId(skillProfileId)
                .stream()
                .map(SkillProfileSkill::getSkill)
                .toList();
    }

    /**
     * Get all skill profiles associated with a skill.
     *
     * @param skillId the skill ID
     * @return list of skill profiles
     */
    public List<SkillProfile> getSkillProfilesBySkillId(Long skillId) {
        return skillProfileSkillRepository.findBySkillId(skillId)
                .stream()
                .map(SkillProfileSkill::getSkillProfile)
                .toList();
    }

    /**
     * Associate a skill with a skill profile.
     *
     * @param skillId the skill ID
     * @param skillProfileId the skill profile ID
     * @throws ResourceNotFoundException if skill or skill profile doesn't exist
     * @throws DuplicateResourceException if association already exists
     */
    @Transactional
    public void associateSkillWithSkillProfile(Long skillId, Long skillProfileId) {
        // Validate that skill profile exists
        SkillProfile skillProfile = skillProfileRepository.findById(skillProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill profile not found with id: " + skillProfileId));

        // Validate that skill exists
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + skillId));

        // Check if association already exists
        if (skillProfileSkillRepository.existsBySkillProfileIdAndSkillId(skillProfileId, skillId)) {
            throw new DuplicateResourceException("Skill is already associated with this skill profile");
        }

        // Create and save the association
        SkillProfileSkill association = new SkillProfileSkill(skillProfile, skill);
        skillProfileSkillRepository.save(association);
    }

    /**
     * Remove the association between a skill and a skill profile.
     *
     * @param skillId the skill ID
     * @param skillProfileId the skill profile ID
     * @throws ResourceNotFoundException if the association doesn't exist
     */
    @Transactional
    public void removeAssociation(Long skillId, Long skillProfileId) {
        // Check if association exists
        if (!skillProfileSkillRepository.existsBySkillProfileIdAndSkillId(skillProfileId, skillId)) {
            throw new ResourceNotFoundException("Association not found between skill " + skillId + " and skill profile " + skillProfileId);
        }

        // Delete the association
        skillProfileSkillRepository.deleteBySkillProfileIdAndSkillId(skillProfileId, skillId);
    }
}
