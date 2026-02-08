package org.gga.skills.repository;

import org.gga.skills.model.EmployeeSkillProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSkillProfileRepository extends JpaRepository<EmployeeSkillProfile, Long> {

    List<EmployeeSkillProfile> findByEmployeeId(Long employeeId);

    List<EmployeeSkillProfile> findBySkillProfileId(Long skillProfileId);

    Optional<EmployeeSkillProfile> findByEmployeeIdAndSkillProfileId(Long employeeId, Long skillProfileId);

    boolean existsByEmployeeIdAndSkillProfileId(Long employeeId, Long skillProfileId);

    void deleteByEmployeeIdAndSkillProfileId(Long employeeId, Long skillProfileId);
}
