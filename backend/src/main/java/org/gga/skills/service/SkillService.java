package org.gga.skills.service;

import org.gga.skills.dto.SkillRequest;
import org.gga.skills.dto.SkillResponse;
import org.gga.skills.model.Skill;
import org.gga.skills.model.SkillProfile;
import org.gga.skills.repository.SkillProfileRepository;
import org.gga.skills.repository.SkillRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class SkillService {

    private final SkillRepository skillRepository;
    private final SkillProfileRepository skillProfileRepository;

    public SkillService(SkillRepository skillRepository, SkillProfileRepository skillProfileRepository) {
        this.skillRepository = skillRepository;
        this.skillProfileRepository = skillProfileRepository;
    }

    public List<SkillResponse> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(SkillResponse::fromEntity)
                .toList();
    }

    public Page<SkillResponse> getAllSkills(Pageable pageable) {
        return skillRepository.findAll(pageable)
                .map(SkillResponse::fromEntity);
    }

    public SkillResponse getSkillById(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));
        return SkillResponse.fromEntity(skill);
    }

    public List<SkillResponse> getSkillsByProfileId(Long profileId) {
        if (!skillProfileRepository.existsById(profileId)) {
            throw new ResourceNotFoundException("Skill profile not found with id: " + profileId);
        }
        return skillRepository.findBySkillProfileId(profileId).stream()
                .map(SkillResponse::fromEntity)
                .toList();
    }

    @Transactional
    public SkillResponse createSkill(SkillRequest request) {
        if (skillRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Skill with name " + request.name() + " already exists");
        }

        SkillProfile skillProfile = skillProfileRepository.findById(request.skillProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill profile not found with id: " + request.skillProfileId()));

        Skill skill = new Skill(request.name(), skillProfile);
        skill.setDescription(request.description());

        Skill saved = skillRepository.save(skill);
        return SkillResponse.fromEntity(saved);
    }

    @Transactional
    public SkillResponse updateSkill(Long id, SkillRequest request) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));

        if (!skill.getName().equals(request.name()) &&
                skillRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Skill with name " + request.name() + " already exists");
        }

        SkillProfile skillProfile = skillProfileRepository.findById(request.skillProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill profile not found with id: " + request.skillProfileId()));

        skill.setName(request.name());
        skill.setSkillProfile(skillProfile);
        skill.setDescription(request.description());

        Skill updated = skillRepository.save(skill);
        return SkillResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteSkill(Long id) {
        if (!skillRepository.existsById(id)) {
            throw new ResourceNotFoundException("Skill not found with id: " + id);
        }
        skillRepository.deleteById(id);
    }
}
