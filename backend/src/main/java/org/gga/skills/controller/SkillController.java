package org.gga.skills.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.gga.skills.dto.SkillRequest;
import org.gga.skills.dto.SkillResponse;
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

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    @Operation(summary = "Get all skills", description = "Retrieve all skills with optional pagination")
    public List<SkillResponse> getAllSkills(@RequestParam(required = false) Long profileId,
                                             @RequestParam(required = false) Boolean paginated,
                                             Pageable pageable) {
        if (profileId != null) {
            return skillService.getSkillsByProfileId(profileId);
        }
        if (Boolean.TRUE.equals(paginated)) {
            return skillService.getAllSkills(pageable).getContent();
        }
        return skillService.getAllSkills();
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
}
