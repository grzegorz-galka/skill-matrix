package org.gga.skills.repository;

import org.gga.skills.model.SkillGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillGradeRepository extends JpaRepository<SkillGrade, Long> {

    List<SkillGrade> findBySkillId(Long skillId);

    Optional<SkillGrade> findBySkillIdAndCode(Long skillId, String code);

    boolean existsBySkillIdAndCode(Long skillId, String code);
}
