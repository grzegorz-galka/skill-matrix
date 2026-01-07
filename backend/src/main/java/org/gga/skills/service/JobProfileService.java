package org.gga.skills.service;

import org.gga.skills.dto.JobProfileRequest;
import org.gga.skills.dto.JobProfileResponse;
import org.gga.skills.model.JobProfile;
import org.gga.skills.repository.JobProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class JobProfileService {

    private final JobProfileRepository jobProfileRepository;

    public JobProfileService(JobProfileRepository jobProfileRepository) {
        this.jobProfileRepository = jobProfileRepository;
    }

    public List<JobProfileResponse> getAllJobProfiles() {
        return jobProfileRepository.findAll().stream()
                .map(JobProfileResponse::fromEntity)
                .toList();
    }

    public Page<JobProfileResponse> getAllJobProfiles(Pageable pageable) {
        return jobProfileRepository.findAll(pageable)
                .map(JobProfileResponse::fromEntity);
    }

    public JobProfileResponse getJobProfileById(Long id) {
        JobProfile jobProfile = jobProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job profile not found with id: " + id));
        return JobProfileResponse.fromEntity(jobProfile);
    }

    @Transactional
    public JobProfileResponse createJobProfile(JobProfileRequest request) {
        if (jobProfileRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Job profile with name " + request.name() + " already exists");
        }

        JobProfile jobProfile = new JobProfile(
                request.name(),
                request.description()
        );

        JobProfile saved = jobProfileRepository.save(jobProfile);
        return JobProfileResponse.fromEntity(saved);
    }

    @Transactional
    public JobProfileResponse updateJobProfile(Long id, JobProfileRequest request) {
        JobProfile jobProfile = jobProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job profile not found with id: " + id));

        if (!jobProfile.getName().equals(request.name()) &&
                jobProfileRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Job profile with name " + request.name() + " already exists");
        }

        jobProfile.setName(request.name());
        jobProfile.setDescription(request.description());

        JobProfile updated = jobProfileRepository.save(jobProfile);
        return JobProfileResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteJobProfile(Long id) {
        if (!jobProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("Job profile not found with id: " + id);
        }
        jobProfileRepository.deleteById(id);
    }
}
