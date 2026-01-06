package org.gga.skills.repository;

import org.gga.skills.model.EmployeeSkillGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSkillGradeRepository extends JpaRepository<EmployeeSkillGrade, Long> {

    List<EmployeeSkillGrade> findByEmployeeId(Long employeeId);

    List<EmployeeSkillGrade> findBySkillGradeId(Long skillGradeId);

    Optional<EmployeeSkillGrade> findByEmployeeIdAndSkillGradeId(Long employeeId, Long skillGradeId);

    boolean existsByEmployeeIdAndSkillGradeId(Long employeeId, Long skillGradeId);

    void deleteByEmployeeIdAndSkillGradeId(Long employeeId, Long skillGradeId);

    List<EmployeeSkillGrade> findByCertified(Boolean certified);

    @Query("SELECT esg FROM EmployeeSkillGrade esg WHERE esg.reviewedBy.id = :reviewerId")
    List<EmployeeSkillGrade> findByReviewerId(Long reviewerId);
}
