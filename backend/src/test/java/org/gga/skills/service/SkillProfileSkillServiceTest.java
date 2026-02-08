package org.gga.skills.service;

import org.gga.skills.model.Skill;
import org.gga.skills.model.SkillProfile;
import org.gga.skills.model.SkillProfileSkill;
import org.gga.skills.repository.SkillProfileRepository;
import org.gga.skills.repository.SkillProfileSkillRepository;
import org.gga.skills.repository.SkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SkillProfileSkillServiceTest {

    @Mock
    private SkillProfileSkillRepository skillProfileSkillRepository;
    @Mock
    private SkillProfileRepository skillProfileRepository;
    @Mock
    private SkillRepository skillRepository;

    @InjectMocks
    private SkillProfileSkillService service;

    private Skill skill;
    private SkillProfile skillProfile;

    @BeforeEach
    void setUp() {
        skill = new Skill("Java");
        skill.setId(1L);
        skillProfile = new SkillProfile("Backend Developer", "Backend skills");
        skillProfile.setId(10L);
    }

    // --- ASSOCIATE TESTS ---

    @Test
    void associateSkillWithSkillProfile_WhenSkillProfileNotFound_ThrowsResourceNotFoundException() {
        when(skillProfileRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.associateSkillWithSkillProfile(1L, 10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Skill profile not found");

        verify(skillRepository, never()).findById(any());
        verify(skillProfileSkillRepository, never()).save(any());
    }

    @Test
    void associateSkillWithSkillProfile_WhenSkillNotFound_ThrowsResourceNotFoundException() {
        when(skillProfileRepository.findById(10L)).thenReturn(Optional.of(skillProfile));
        when(skillRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.associateSkillWithSkillProfile(1L, 10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Skill not found");

        verify(skillProfileSkillRepository, never()).save(any());
    }

    @Test
    void associateSkillWithSkillProfile_WhenAlreadyAssociated_ThrowsDuplicateResourceException() {
        when(skillProfileRepository.findById(10L)).thenReturn(Optional.of(skillProfile));
        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));
        when(skillProfileSkillRepository.existsBySkillProfileIdAndSkillId(10L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> service.associateSkillWithSkillProfile(1L, 10L))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already associated");

        verify(skillProfileSkillRepository, never()).save(any());
    }

    @Test
    void associateSkillWithSkillProfile_WhenAllValid_SavesAssociation() {
        when(skillProfileRepository.findById(10L)).thenReturn(Optional.of(skillProfile));
        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));
        when(skillProfileSkillRepository.existsBySkillProfileIdAndSkillId(10L, 1L)).thenReturn(false);

        service.associateSkillWithSkillProfile(1L, 10L);

        verify(skillProfileSkillRepository).save(any(SkillProfileSkill.class));
    }

    // --- REMOVE ASSOCIATION TESTS ---

    @Test
    void removeAssociation_WhenNotFound_ThrowsResourceNotFoundException() {
        when(skillProfileSkillRepository.existsBySkillProfileIdAndSkillId(10L, 1L)).thenReturn(false);

        assertThatThrownBy(() -> service.removeAssociation(1L, 10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Association not found");

        verify(skillProfileSkillRepository, never()).deleteBySkillProfileIdAndSkillId(any(), any());
    }

    @Test
    void removeAssociation_WhenExists_DeletesSuccessfully() {
        when(skillProfileSkillRepository.existsBySkillProfileIdAndSkillId(10L, 1L)).thenReturn(true);

        service.removeAssociation(1L, 10L);

        verify(skillProfileSkillRepository).deleteBySkillProfileIdAndSkillId(10L, 1L);
    }
}
