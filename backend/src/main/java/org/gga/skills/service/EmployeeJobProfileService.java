package org.gga.skills.service;

import org.gga.skills.dto.JobProfileResponse;
import org.gga.skills.model.Employee;
import org.gga.skills.model.EmployeeJobProfile;
import org.gga.skills.model.JobProfile;
import org.gga.skills.repository.EmployeeRepository;
import org.gga.skills.repository.EmployeeJobProfileRepository;
import org.gga.skills.repository.JobProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class EmployeeJobProfileService {

    private final EmployeeJobProfileRepository employeeJobProfileRepository;
    private final EmployeeRepository employeeRepository;
    private final JobProfileRepository jobProfileRepository;

    public EmployeeJobProfileService(EmployeeJobProfileRepository employeeJobProfileRepository,
                                       EmployeeRepository employeeRepository,
                                       JobProfileRepository jobProfileRepository) {
        this.employeeJobProfileRepository = employeeJobProfileRepository;
        this.employeeRepository = employeeRepository;
        this.jobProfileRepository = jobProfileRepository;
    }

    public List<JobProfileResponse> getJobProfilesByEmployeeId(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found with id: " + employeeId);
        }
        return employeeJobProfileRepository.findByEmployeeId(employeeId).stream()
                .map(ejp -> JobProfileResponse.fromEntity(ejp.getJobProfile()))
                .toList();
    }

    @Transactional
    public void assignJobProfileToEmployee(Long employeeId, Long jobProfileId) {
        if (employeeJobProfileRepository.existsByEmployeeIdAndJobProfileId(employeeId, jobProfileId)) {
            throw new DuplicateResourceException("Employee already has this job profile assigned");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        JobProfile jobProfile = jobProfileRepository.findById(jobProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Job profile not found with id: " + jobProfileId));

        EmployeeJobProfile ejp = new EmployeeJobProfile(employee, jobProfile);
        employeeJobProfileRepository.save(ejp);
    }

    @Transactional
    public void removeJobProfileFromEmployee(Long employeeId, Long jobProfileId) {
        if (!employeeJobProfileRepository.existsByEmployeeIdAndJobProfileId(employeeId, jobProfileId)) {
            throw new ResourceNotFoundException("Employee does not have this job profile assigned");
        }
        employeeJobProfileRepository.deleteByEmployeeIdAndJobProfileId(employeeId, jobProfileId);
    }
}
