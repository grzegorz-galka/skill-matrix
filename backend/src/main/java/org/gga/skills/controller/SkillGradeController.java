package org.gga.skills.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.gga.skills.dto.SkillGradeRequest;
import org.gga.skills.dto.SkillGradeResponse;
import org.gga.skills.service.SkillGradeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-grades")
@Tag(name = "Skill Grades", description = "Skill grade management APIs")
public class SkillGradeController {

    private final SkillGradeService skillGradeService;

    public SkillGradeController(SkillGradeService skillGradeService) {
        this.skillGradeService = skillGradeService;
    }

    @GetMapping
    @Operation(summary = "Get all skill grades", description = "Retrieve all skill grades")
    public List<SkillGradeResponse> getAllSkillGrades(@RequestParam(required = false) Long skillId,
                                                        @RequestParam(required = false) Boolean paginated,
                                                        Pageable pageable) {
        if (skillId != null) {
            return skillGradeService.getSkillGradesBySkillId(skillId);
        }
        if (Boolean.TRUE.equals(paginated)) {
            return skillGradeService.getAllSkillGrades(pageable).getContent();
        }
        return skillGradeService.getAllSkillGrades();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get skill grade by ID", description = "Retrieve a single skill grade by its ID")
    public SkillGradeResponse getSkillGradeById(@PathVariable Long id) {
        return skillGradeService.getSkillGradeById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new skill grade", description = "Create a new skill grade")
    public SkillGradeResponse createSkillGrade(@Valid @RequestBody SkillGradeRequest request) {
        return skillGradeService.createSkillGrade(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a skill grade", description = "Update an existing skill grade")
    public SkillGradeResponse updateSkillGrade(@PathVariable Long id,
                                                 @Valid @RequestBody SkillGradeRequest request) {
        return skillGradeService.updateSkillGrade(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a skill grade", description = "Delete a skill grade by its ID")
    public void deleteSkillGrade(@PathVariable Long id) {
        skillGradeService.deleteSkillGrade(id);
    }
}
