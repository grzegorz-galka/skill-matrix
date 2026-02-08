package org.gga.skills.service;

import org.gga.skills.dto.SkillRequest;
import org.gga.skills.dto.SkillResponse;
import org.gga.skills.model.Skill;
import org.gga.skills.model.SkillGrade;
import org.gga.skills.model.SkillProfile;
import org.gga.skills.model.SkillProfileSkill;
import org.gga.skills.repository.SkillGradeRepository;
import org.gga.skills.repository.SkillProfileSkillRepository;
import org.gga.skills.repository.SkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SkillServiceTest {

    @Mock
    private SkillRepository skillRepository;
    @Mock
    private SkillProfileSkillRepository skillProfileSkillRepository;
    @Mock
    private SkillGradeRepository skillGradeRepository;

    @InjectMocks
    private SkillService skillService;

    private Skill skill;
    private SkillProfile skillProfile;
    private SkillGrade grade;

    @BeforeEach
    void setUp() {
        skill = new Skill("Java");
        skill.setId(1L);
        skill.setDescription("Java programming");

        skillProfile = new SkillProfile("Backend Developer", "Backend skills");
        skillProfile.setId(10L);

        grade = new SkillGrade();
        grade.setId(100L);
        grade.setCode("INTERMEDIATE");
        grade.setSkill(skill);
    }

    // --- GET BY ID - AGGREGATION TESTS ---

    @Test
    void getSkillById_AggregatesSkillProfilesAndGrades() {
        SkillProfileSkill sps = new SkillProfileSkill(skillProfile, skill);

        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));
        when(skillProfileSkillRepository.findBySkillId(1L)).thenReturn(List.of(sps));
        when(skillGradeRepository.findBySkillId(1L)).thenReturn(List.of(grade));

        SkillResponse response = skillService.getSkillById(1L);

        assertThat(response.name()).isEqualTo("Java");
        assertThat(response.skillProfiles()).hasSize(1);
        assertThat(response.skillProfiles().get(0).name()).isEqualTo("Backend Developer");
        assertThat(response.grades()).hasSize(1);
        assertThat(response.grades().get(0).code()).isEqualTo("INTERMEDIATE");
    }

    @Test
    void getSkillById_WhenNoAssociations_ReturnsEmptyLists() {
        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));
        when(skillProfileSkillRepository.findBySkillId(1L)).thenReturn(List.of());
        when(skillGradeRepository.findBySkillId(1L)).thenReturn(List.of());

        SkillResponse response = skillService.getSkillById(1L);

        assertThat(response.skillProfiles()).isEmpty();
        assertThat(response.grades()).isEmpty();
    }

    @Test
    void getSkillById_WhenNotFound_ThrowsResourceNotFoundException() {
        when(skillRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> skillService.getSkillById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    // --- CREATE TESTS ---

    @Test
    void createSkill_WithDuplicateName_ThrowsDuplicateResourceException() {
        SkillRequest request = new SkillRequest("Java", "Description");
        when(skillRepository.existsByName("Java")).thenReturn(true);

        assertThatThrownBy(() -> skillService.createSkill(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(skillRepository, never()).save(any());
    }

    @Test
    void createSkill_ReturnsEmptyAssociationLists() {
        SkillRequest request = new SkillRequest("Python", "Python programming");
        Skill saved = new Skill("Python");
        saved.setId(2L);

        when(skillRepository.existsByName("Python")).thenReturn(false);
        when(skillRepository.save(any(Skill.class))).thenReturn(saved);

        SkillResponse response = skillService.createSkill(request);

        // New skills have no profiles or grades yet
        assertThat(response.skillProfiles()).isEmpty();
        assertThat(response.grades()).isEmpty();
    }

    // --- UPDATE TESTS ---

    @Test
    void updateSkill_WhenNameUnchanged_SkipsDuplicateCheck() {
        SkillRequest request = new SkillRequest("Java", "Updated description");

        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));
        when(skillRepository.save(any(Skill.class))).thenReturn(skill);
        when(skillProfileSkillRepository.findBySkillId(1L)).thenReturn(List.of());
        when(skillGradeRepository.findBySkillId(1L)).thenReturn(List.of());

        skillService.updateSkill(1L, request);

        verify(skillRepository, never()).existsByName(any());
    }

    @Test
    void updateSkill_WhenNameChangedToExisting_ThrowsDuplicateResourceException() {
        SkillRequest request = new SkillRequest("Python", "Description");

        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));
        when(skillRepository.existsByName("Python")).thenReturn(true);

        assertThatThrownBy(() -> skillService.updateSkill(1L, request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void updateSkill_WhenNameChangedToUnique_UpdatesSuccessfully() {
        SkillRequest request = new SkillRequest("Advanced Java", "Updated");

        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));
        when(skillRepository.existsByName("Advanced Java")).thenReturn(false);
        when(skillRepository.save(any(Skill.class))).thenReturn(skill);
        when(skillProfileSkillRepository.findBySkillId(1L)).thenReturn(List.of());
        when(skillGradeRepository.findBySkillId(1L)).thenReturn(List.of());

        skillService.updateSkill(1L, request);

        verify(skillRepository).save(any(Skill.class));
    }

    @Test
    void updateSkill_FetchesAssociationsAfterSave() {
        SkillRequest request = new SkillRequest("Java", "Updated");
        SkillProfileSkill sps = new SkillProfileSkill(skillProfile, skill);

        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));
        when(skillRepository.save(any(Skill.class))).thenReturn(skill);
        when(skillProfileSkillRepository.findBySkillId(1L)).thenReturn(List.of(sps));
        when(skillGradeRepository.findBySkillId(1L)).thenReturn(List.of(grade));

        SkillResponse response = skillService.updateSkill(1L, request);

        assertThat(response.skillProfiles()).hasSize(1);
        assertThat(response.grades()).hasSize(1);
    }

    @Test
    void updateSkill_WhenNotFound_ThrowsResourceNotFoundException() {
        SkillRequest request = new SkillRequest("Name", "Desc");
        when(skillRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> skillService.updateSkill(999L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- DELETE TESTS ---

    @Test
    void deleteSkill_WhenNotFound_ThrowsResourceNotFoundException() {
        when(skillRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> skillService.deleteSkill(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(skillRepository, never()).deleteById(any());
    }

    @Test
    void deleteSkill_WhenExists_DeletesSuccessfully() {
        when(skillRepository.existsById(1L)).thenReturn(true);

        skillService.deleteSkill(1L);

        verify(skillRepository).deleteById(1L);
    }
}
