package org.gga.skills.service;

import org.gga.skills.dto.SkillProfileRequest;
import org.gga.skills.dto.SkillProfileResponse;
import org.gga.skills.model.SkillProfile;
import org.gga.skills.repository.SkillProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class SkillProfileService {

    private final SkillProfileRepository skillProfileRepository;

    public SkillProfileService(SkillProfileRepository skillProfileRepository) {
        this.skillProfileRepository = skillProfileRepository;
    }

    public List<SkillProfileResponse> getAllSkillProfiles() {
        return skillProfileRepository.findAll().stream()
                .map(SkillProfileResponse::fromEntity)
                .toList();
    }

    public Page<SkillProfileResponse> getAllSkillProfiles(Pageable pageable) {
        return skillProfileRepository.findAll(pageable)
                .map(SkillProfileResponse::fromEntity);
    }

    public SkillProfileResponse getSkillProfileById(Long id) {
        SkillProfile skillProfile = skillProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill profile not found with id: " + id));
        return SkillProfileResponse.fromEntity(skillProfile);
    }

    @Transactional
    public SkillProfileResponse createSkillProfile(SkillProfileRequest request) {
        if (skillProfileRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Skill profile with name " + request.name() + " already exists");
        }

        SkillProfile skillProfile = new SkillProfile(
                request.name(),
                request.description()
        );

        SkillProfile saved = skillProfileRepository.save(skillProfile);
        return SkillProfileResponse.fromEntity(saved);
    }

    @Transactional
    public SkillProfileResponse updateSkillProfile(Long id, SkillProfileRequest request) {
        SkillProfile skillProfile = skillProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill profile not found with id: " + id));

        if (!skillProfile.getName().equals(request.name()) &&
                skillProfileRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Skill profile with name " + request.name() + " already exists");
        }

        skillProfile.setName(request.name());
        skillProfile.setDescription(request.description());

        SkillProfile updated = skillProfileRepository.save(skillProfile);
        return SkillProfileResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteSkillProfile(Long id) {
        if (!skillProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("Skill profile not found with id: " + id);
        }
        skillProfileRepository.deleteById(id);
    }
}
