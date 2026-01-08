package org.gga.skills.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.gga.skills.dto.JobProfileRequest;
import org.gga.skills.dto.JobProfileResponse;
import org.gga.skills.service.JobProfileService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-profiles")
@Tag(name = "Job Profiles", description = "Job profile management APIs")
public class JobProfileController {

    private final JobProfileService jobProfileService;

    public JobProfileController(JobProfileService jobProfileService) {
        this.jobProfileService = jobProfileService;
    }

    @GetMapping
    @Operation(summary = "Get all job profiles", description = "Retrieve all job profiles")
    public List<JobProfileResponse> getAllJobProfiles(@RequestParam(required = false) Boolean paginated,
                                                       Pageable pageable) {
        if (Boolean.TRUE.equals(paginated)) {
            return jobProfileService.getAllJobProfiles(pageable).getContent();
        }
        return jobProfileService.getAllJobProfiles();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job profile by ID", description = "Retrieve a single job profile by its ID")
    public JobProfileResponse getJobProfileById(@PathVariable Long id) {
        return jobProfileService.getJobProfileById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new job profile", description = "Create a new job profile")
    public JobProfileResponse createJobProfile(@Valid @RequestBody JobProfileRequest request) {
        return jobProfileService.createJobProfile(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a job profile", description = "Update an existing job profile")
    public JobProfileResponse updateJobProfile(@PathVariable Long id,
                                                @Valid @RequestBody JobProfileRequest request) {
        return jobProfileService.updateJobProfile(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a job profile", description = "Delete a job profile by its ID")
    public void deleteJobProfile(@PathVariable Long id) {
        jobProfileService.deleteJobProfile(id);
    }
}
