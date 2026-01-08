package org.gga.skills.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.gga.skills.dto.JobProfileResponse;
import org.gga.skills.dto.SkillRequest;
import org.gga.skills.dto.SkillResponse;
import org.gga.skills.service.JobProfileSkillService;
import org.gga.skills.service.SkillService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@Tag(name = "Skills", description = "Skill management APIs")
public class SkillController {

    private final SkillService skillService;
    private final JobProfileSkillService jobProfileSkillService;

    public SkillController(SkillService skillService,
                          JobProfileSkillService jobProfileSkillService) {
        this.skillService = skillService;
        this.jobProfileSkillService = jobProfileSkillService;
    }

    @GetMapping
    @Operation(summary = "Get all skills", description = "Retrieve all skills with pagination")
    public Page<SkillResponse> getAllSkills(Pageable pageable) {
        return skillService.getAllSkills(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get skill by ID", description = "Retrieve a single skill by its ID")
    public SkillResponse getSkillById(@PathVariable Long id) {
        return skillService.getSkillById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new skill", description = "Create a new skill")
    public SkillResponse createSkill(@Valid @RequestBody SkillRequest request) {
        return skillService.createSkill(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a skill", description = "Update an existing skill")
    public SkillResponse updateSkill(@PathVariable Long id,
                                     @Valid @RequestBody SkillRequest request) {
        return skillService.updateSkill(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a skill", description = "Delete a skill by its ID")
    public void deleteSkill(@PathVariable Long id) {
        skillService.deleteSkill(id);
    }

    @PostMapping("/{skillId}/job-profiles/{jobProfileId}")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Associate skill with job profile", description = "Create association between a skill and a job profile")
    public void associateWithJobProfile(@PathVariable Long skillId,
                                        @PathVariable Long jobProfileId) {
        jobProfileSkillService.associateSkillWithJobProfile(skillId, jobProfileId);
    }

    @DeleteMapping("/{skillId}/job-profiles/{jobProfileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove skill from job profile", description = "Remove association between a skill and a job profile")
    public void removeFromJobProfile(@PathVariable Long skillId,
                                     @PathVariable Long jobProfileId) {
        jobProfileSkillService.removeAssociation(skillId, jobProfileId);
    }

    @GetMapping("/{skillId}/job-profiles")
    @Operation(summary = "Get job profiles for skill", description = "Retrieve all job profiles associated with a skill")
    public List<JobProfileResponse> getJobProfilesForSkill(@PathVariable Long skillId) {
        return jobProfileSkillService.getJobProfilesBySkillId(skillId).stream()
                .map(JobProfileResponse::fromEntity)
                .toList();
    }
}
