package org.gga.skills.repository;

import org.gga.skills.model.EmployeeJobProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeJobProfileRepository extends JpaRepository<EmployeeJobProfile, Long> {

    List<EmployeeJobProfile> findByEmployeeId(Long employeeId);

    List<EmployeeJobProfile> findByJobProfileId(Long jobProfileId);

    Optional<EmployeeJobProfile> findByEmployeeIdAndJobProfileId(Long employeeId, Long jobProfileId);

    boolean existsByEmployeeIdAndJobProfileId(Long employeeId, Long jobProfileId);

    void deleteByEmployeeIdAndJobProfileId(Long employeeId, Long jobProfileId);
}
