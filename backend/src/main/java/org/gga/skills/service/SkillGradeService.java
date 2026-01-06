package org.gga.skills.service;

import org.gga.skills.dto.SkillGradeRequest;
import org.gga.skills.dto.SkillGradeResponse;
import org.gga.skills.model.Skill;
import org.gga.skills.model.SkillGrade;
import org.gga.skills.repository.SkillGradeRepository;
import org.gga.skills.repository.SkillRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class SkillGradeService {

    private final SkillGradeRepository skillGradeRepository;
    private final SkillRepository skillRepository;

    public SkillGradeService(SkillGradeRepository skillGradeRepository, SkillRepository skillRepository) {
        this.skillGradeRepository = skillGradeRepository;
        this.skillRepository = skillRepository;
    }

    public List<SkillGradeResponse> getAllSkillGrades() {
        return skillGradeRepository.findAll().stream()
                .map(SkillGradeResponse::fromEntity)
                .toList();
    }

    public Page<SkillGradeResponse> getAllSkillGrades(Pageable pageable) {
        return skillGradeRepository.findAll(pageable)
                .map(SkillGradeResponse::fromEntity);
    }

    public SkillGradeResponse getSkillGradeById(Long id) {
        SkillGrade skillGrade = skillGradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill grade not found with id: " + id));
        return SkillGradeResponse.fromEntity(skillGrade);
    }

    public List<SkillGradeResponse> getSkillGradesBySkillId(Long skillId) {
        if (!skillRepository.existsById(skillId)) {
            throw new ResourceNotFoundException("Skill not found with id: " + skillId);
        }
        return skillGradeRepository.findBySkillId(skillId).stream()
                .map(SkillGradeResponse::fromEntity)
                .toList();
    }

    @Transactional
    public SkillGradeResponse createSkillGrade(SkillGradeRequest request) {
        if (skillGradeRepository.existsBySkillIdAndCode(request.skillId(), request.code())) {
            throw new DuplicateResourceException("Skill grade with code " + request.code() +
                    " already exists for skill id: " + request.skillId());
        }

        Skill skill = skillRepository.findById(request.skillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + request.skillId()));

        SkillGrade skillGrade = new SkillGrade(skill, request.code(), request.description());

        SkillGrade saved = skillGradeRepository.save(skillGrade);
        return SkillGradeResponse.fromEntity(saved);
    }

    @Transactional
    public SkillGradeResponse updateSkillGrade(Long id, SkillGradeRequest request) {
        SkillGrade skillGrade = skillGradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill grade not found with id: " + id));

        Skill skill = skillRepository.findById(request.skillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + request.skillId()));

        boolean codeChanged = !skillGrade.getCode().equals(request.code());
        boolean skillChanged = !skillGrade.getSkill().getId().equals(request.skillId());

        if ((codeChanged || skillChanged) &&
                skillGradeRepository.existsBySkillIdAndCode(request.skillId(), request.code())) {
            throw new DuplicateResourceException("Skill grade with code " + request.code() +
                    " already exists for skill id: " + request.skillId());
        }

        skillGrade.setSkill(skill);
        skillGrade.setCode(request.code());
        skillGrade.setDescription(request.description());

        SkillGrade updated = skillGradeRepository.save(skillGrade);
        return SkillGradeResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteSkillGrade(Long id) {
        if (!skillGradeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Skill grade not found with id: " + id);
        }
        skillGradeRepository.deleteById(id);
    }
}
