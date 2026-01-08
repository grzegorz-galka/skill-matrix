package org.gga.skills.service;

import org.gga.skills.dto.SkillRequest;
import org.gga.skills.dto.SkillResponse;
import org.gga.skills.model.JobProfile;
import org.gga.skills.model.Skill;
import org.gga.skills.repository.JobProfileSkillRepository;
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
    private final JobProfileSkillRepository jobProfileSkillRepository;

    public SkillService(SkillRepository skillRepository,
                       JobProfileSkillRepository jobProfileSkillRepository) {
        this.skillRepository = skillRepository;
        this.jobProfileSkillRepository = jobProfileSkillRepository;
    }

    public List<SkillResponse> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(skill -> {
                    List<JobProfile> jobProfiles = jobProfileSkillRepository.findBySkillId(skill.getId())
                            .stream()
                            .map(jps -> jps.getJobProfile())
                            .toList();
                    return SkillResponse.fromEntity(skill, jobProfiles);
                })
                .toList();
    }

    public Page<SkillResponse> getAllSkills(Pageable pageable) {
        return skillRepository.findAll(pageable)
                .map(skill -> {
                    List<JobProfile> jobProfiles = jobProfileSkillRepository.findBySkillId(skill.getId())
                            .stream()
                            .map(jps -> jps.getJobProfile())
                            .toList();
                    return SkillResponse.fromEntity(skill, jobProfiles);
                });
    }

    public SkillResponse getSkillById(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));

        List<JobProfile> jobProfiles = jobProfileSkillRepository.findBySkillId(id)
                .stream()
                .map(jps -> jps.getJobProfile())
                .toList();

        return SkillResponse.fromEntity(skill, jobProfiles);
    }

    @Transactional
    public SkillResponse createSkill(SkillRequest request) {
        if (skillRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Skill with name " + request.name() + " already exists");
        }

        Skill skill = new Skill(request.name());
        skill.setDescription(request.description());

        Skill saved = skillRepository.save(skill);

        // Return skill with empty job profiles list
        return SkillResponse.fromEntity(saved, List.of());
    }

    @Transactional
    public SkillResponse updateSkill(Long id, SkillRequest request) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));

        if (!skill.getName().equals(request.name()) &&
                skillRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Skill with name " + request.name() + " already exists");
        }

        skill.setName(request.name());
        skill.setDescription(request.description());

        Skill updated = skillRepository.save(skill);

        // Fetch associated job profiles
        List<JobProfile> jobProfiles = jobProfileSkillRepository.findBySkillId(id)
                .stream()
                .map(jps -> jps.getJobProfile())
                .toList();

        return SkillResponse.fromEntity(updated, jobProfiles);
    }

    @Transactional
    public void deleteSkill(Long id) {
        if (!skillRepository.existsById(id)) {
            throw new ResourceNotFoundException("Skill not found with id: " + id);
        }
        skillRepository.deleteById(id);
    }
}
