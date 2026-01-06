package org.gga.skills.repository;

import org.gga.skills.model.SkillProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SkillProfileRepository extends JpaRepository<SkillProfile, Long> {

    Optional<SkillProfile> findByName(String name);

    boolean existsByName(String name);
}
