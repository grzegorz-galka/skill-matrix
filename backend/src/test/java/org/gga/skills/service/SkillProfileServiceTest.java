package org.gga.skills.service;

import org.gga.skills.dto.SkillProfileRequest;
import org.gga.skills.dto.SkillProfileResponse;
import org.gga.skills.model.SkillProfile;
import org.gga.skills.repository.SkillProfileRepository;
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
class SkillProfileServiceTest {

    @Mock
    private SkillProfileRepository skillProfileRepository;

    @InjectMocks
    private SkillProfileService skillProfileService;

    private SkillProfile existingProfile;

    @BeforeEach
    void setUp() {
        existingProfile = new SkillProfile("Java Developer", "Java skills");
        existingProfile.setId(1L);
    }

    // --- CREATE TESTS ---

    @Test
    void createSkillProfile_WithDuplicateName_ThrowsDuplicateResourceException() {
        SkillProfileRequest request = new SkillProfileRequest("Java Developer", "Description");
        when(skillProfileRepository.existsByName("Java Developer")).thenReturn(true);

        assertThatThrownBy(() -> skillProfileService.createSkillProfile(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(skillProfileRepository, never()).save(any());
    }

    @Test
    void createSkillProfile_WithUniqueName_CreatesSuccessfully() {
        SkillProfileRequest request = new SkillProfileRequest("Frontend Developer", "React skills");
        SkillProfile saved = new SkillProfile("Frontend Developer", "React skills");
        saved.setId(2L);

        when(skillProfileRepository.existsByName("Frontend Developer")).thenReturn(false);
        when(skillProfileRepository.save(any(SkillProfile.class))).thenReturn(saved);

        SkillProfileResponse response = skillProfileService.createSkillProfile(request);

        assertThat(response.name()).isEqualTo("Frontend Developer");
        verify(skillProfileRepository).save(any(SkillProfile.class));
    }

    // --- UPDATE TESTS ---

    @Test
    void updateSkillProfile_WhenNameUnchanged_SkipsDuplicateCheck() {
        SkillProfileRequest request = new SkillProfileRequest("Java Developer", "Updated description");

        when(skillProfileRepository.findById(1L)).thenReturn(Optional.of(existingProfile));
        when(skillProfileRepository.save(any(SkillProfile.class))).thenReturn(existingProfile);

        skillProfileService.updateSkillProfile(1L, request);

        // existsByName should NOT be called when name hasn't changed
        verify(skillProfileRepository, never()).existsByName(any());
    }

    @Test
    void updateSkillProfile_WhenNameChangedToExisting_ThrowsDuplicateResourceException() {
        SkillProfileRequest request = new SkillProfileRequest("Frontend Developer", "Description");

        when(skillProfileRepository.findById(1L)).thenReturn(Optional.of(existingProfile));
        when(skillProfileRepository.existsByName("Frontend Developer")).thenReturn(true);

        assertThatThrownBy(() -> skillProfileService.updateSkillProfile(1L, request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(skillProfileRepository, never()).save(any());
    }

    @Test
    void updateSkillProfile_WhenNameChangedToUnique_UpdatesSuccessfully() {
        SkillProfileRequest request = new SkillProfileRequest("Senior Java Developer", "Updated");

        when(skillProfileRepository.findById(1L)).thenReturn(Optional.of(existingProfile));
        when(skillProfileRepository.existsByName("Senior Java Developer")).thenReturn(false);
        when(skillProfileRepository.save(any(SkillProfile.class))).thenReturn(existingProfile);

        skillProfileService.updateSkillProfile(1L, request);

        verify(skillProfileRepository).save(any(SkillProfile.class));
    }

    @Test
    void updateSkillProfile_WhenNotFound_ThrowsResourceNotFoundException() {
        SkillProfileRequest request = new SkillProfileRequest("Name", "Desc");
        when(skillProfileRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> skillProfileService.updateSkillProfile(999L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- GET/DELETE TESTS ---

    @Test
    void getSkillProfileById_WhenNotFound_ThrowsResourceNotFoundException() {
        when(skillProfileRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> skillProfileService.getSkillProfileById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void deleteSkillProfile_WhenNotFound_ThrowsResourceNotFoundException() {
        when(skillProfileRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> skillProfileService.deleteSkillProfile(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(skillProfileRepository, never()).deleteById(any());
    }
}
