package org.gga.skills.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.gga.skills.dto.SkillsMatrixFilterRequest;
import org.gga.skills.dto.SkillsMatrixResponse;
import org.gga.skills.service.SkillsMatrixService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Skills Matrix", description = "Skills Matrix report API")
@RestController
@RequestMapping("/api/skills-matrix")
public class SkillsMatrixController {

    private final SkillsMatrixService skillsMatrixService;

    public SkillsMatrixController(SkillsMatrixService skillsMatrixService) {
        this.skillsMatrixService = skillsMatrixService;
    }

    @Operation(summary = "Get skills matrix with optional filters")
    @PostMapping
    public ResponseEntity<SkillsMatrixResponse> getSkillsMatrix(
            @RequestBody(required = false) SkillsMatrixFilterRequest filter) {
        if (filter == null) {
            filter = new SkillsMatrixFilterRequest(null, null, null, null, null);
        }
        return ResponseEntity.ok(skillsMatrixService.getSkillsMatrix(filter));
    }

    @Operation(summary = "Get filter hints based on database values")
    @GetMapping("/filter-hints")
    public ResponseEntity<SkillsMatrixService.SkillsMatrixFilterHints> getFilterHints() {
        return ResponseEntity.ok(skillsMatrixService.getFilterHints());
    }
}
