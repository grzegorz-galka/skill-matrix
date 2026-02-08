package org.gga.skills.service;

import org.gga.skills.dto.SkillRequest;
import org.gga.skills.dto.SkillResponse;
import org.gga.skills.model.SkillProfile;
import org.gga.skills.model.Skill;
import org.gga.skills.model.SkillGrade;
import org.gga.skills.repository.SkillProfileSkillRepository;
import org.gga.skills.repository.SkillGradeRepository;
import org.gga.skills.repository.SkillRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SkillService {

    private final SkillRepository skillRepository;
    private final SkillProfileSkillRepository skillProfileSkillRepository;
    private final SkillGradeRepository skillGradeRepository;

    public SkillService(SkillRepository skillRepository,
                       SkillProfileSkillRepository skillProfileSkillRepository,
                       SkillGradeRepository skillGradeRepository) {
        this.skillRepository = skillRepository;
        this.skillProfileSkillRepository = skillProfileSkillRepository;
        this.skillGradeRepository = skillGradeRepository;
    }

    public List<SkillResponse> getAllSkills() {
        List<Skill> skills = skillRepository.findAll();
        return enrichSkillsWithRelations(skills);
    }

    public Page<SkillResponse> getAllSkills(Pageable pageable) {
        Page<Skill> skillsPage = skillRepository.findAll(pageable);
        List<Skill> skills = skillsPage.getContent();

        if (skills.isEmpty()) {
            return skillsPage.map(skill -> SkillResponse.fromEntity(skill, List.of(), List.of()));
        }

        // Batch load all related data
        List<Long> skillIds = skills.stream().map(Skill::getId).toList();

        Map<Long, List<SkillProfile>> skillProfilesMap = skillProfileSkillRepository.findBySkillIdIn(skillIds)
                .stream()
                .collect(Collectors.groupingBy(
                        sps -> sps.getSkill().getId(),
                        Collectors.mapping(sps -> sps.getSkillProfile(), Collectors.toList())
                ));

        Map<Long, List<SkillGrade>> gradesMap = skillGradeRepository.findBySkillIdIn(skillIds)
                .stream()
                .collect(Collectors.groupingBy(grade -> grade.getSkill().getId()));

        // Map skills to responses using pre-loaded data
        return skillsPage.map(skill -> SkillResponse.fromEntity(
                skill,
                skillProfilesMap.getOrDefault(skill.getId(), List.of()),
                gradesMap.getOrDefault(skill.getId(), List.of())
        ));
    }

    private List<SkillResponse> enrichSkillsWithRelations(List<Skill> skills) {
        if (skills.isEmpty()) {
            return List.of();
        }

        List<Long> skillIds = skills.stream().map(Skill::getId).toList();

        // Batch load all skill profiles and grades in 2 queries instead of N+1
        Map<Long, List<SkillProfile>> skillProfilesMap = skillProfileSkillRepository.findBySkillIdIn(skillIds)
                .stream()
                .collect(Collectors.groupingBy(
                        sps -> sps.getSkill().getId(),
                        Collectors.mapping(sps -> sps.getSkillProfile(), Collectors.toList())
                ));

        Map<Long, List<SkillGrade>> gradesMap = skillGradeRepository.findBySkillIdIn(skillIds)
                .stream()
                .collect(Collectors.groupingBy(grade -> grade.getSkill().getId()));

        return skills.stream()
                .map(skill -> SkillResponse.fromEntity(
                        skill,
                        skillProfilesMap.getOrDefault(skill.getId(), List.of()),
                        gradesMap.getOrDefault(skill.getId(), List.of())
                ))
                .toList();
    }

    public SkillResponse getSkillById(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));

        List<SkillProfile> skillProfiles = skillProfileSkillRepository.findBySkillId(id)
                .stream()
                .map(sps -> sps.getSkillProfile())
                .toList();

        List<SkillGrade> grades = skillGradeRepository.findBySkillId(id);

        return SkillResponse.fromEntity(skill, skillProfiles, grades);
    }

    @Transactional
    public SkillResponse createSkill(SkillRequest request) {
        if (skillRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Skill with name " + request.name() + " already exists");
        }

        Skill skill = new Skill(request.name());
        skill.setDescription(request.description());

        Skill saved = skillRepository.save(skill);

        // Return skill with empty skill profiles and grades lists
        return SkillResponse.fromEntity(saved, List.of(), List.of());
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

        // Fetch associated skill profiles and grades
        List<SkillProfile> skillProfiles = skillProfileSkillRepository.findBySkillId(id)
                .stream()
                .map(sps -> sps.getSkillProfile())
                .toList();

        List<SkillGrade> grades = skillGradeRepository.findBySkillId(id);

        return SkillResponse.fromEntity(updated, skillProfiles, grades);
    }

    @Transactional
    public void deleteSkill(Long id) {
        if (!skillRepository.existsById(id)) {
            throw new ResourceNotFoundException("Skill not found with id: " + id);
        }
        skillRepository.deleteById(id);
    }
}
