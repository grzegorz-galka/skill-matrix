package org.gga.skills.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.gga.skills.dto.SkillProfileRequest;
import org.gga.skills.dto.SkillProfileResponse;
import org.gga.skills.service.SkillProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-profiles")
@Tag(name = "Skill Profiles", description = "Skill profile management APIs")
public class SkillProfileController {

    private final SkillProfileService skillProfileService;

    public SkillProfileController(SkillProfileService skillProfileService) {
        this.skillProfileService = skillProfileService;
    }

    @GetMapping
    @Operation(summary = "Get all skill profiles", description = "Retrieve all skill profiles")
    public List<SkillProfileResponse> getAllSkillProfiles(@RequestParam(required = false) Boolean paginated,
                                                            Pageable pageable) {
        if (Boolean.TRUE.equals(paginated)) {
            return skillProfileService.getAllSkillProfiles(pageable).getContent();
        }
        return skillProfileService.getAllSkillProfiles();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get skill profile by ID", description = "Retrieve a single skill profile by its ID")
    public SkillProfileResponse getSkillProfileById(@PathVariable Long id) {
        return skillProfileService.getSkillProfileById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new skill profile", description = "Create a new skill profile")
    public SkillProfileResponse createSkillProfile(@Valid @RequestBody SkillProfileRequest request) {
        return skillProfileService.createSkillProfile(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a skill profile", description = "Update an existing skill profile")
    public SkillProfileResponse updateSkillProfile(@PathVariable Long id,
                                                     @Valid @RequestBody SkillProfileRequest request) {
        return skillProfileService.updateSkillProfile(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a skill profile", description = "Delete a skill profile by its ID")
    public void deleteSkillProfile(@PathVariable Long id) {
        skillProfileService.deleteSkillProfile(id);
    }
}
