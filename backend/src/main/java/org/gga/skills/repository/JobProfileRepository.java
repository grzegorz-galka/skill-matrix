package org.gga.skills.repository;

import org.gga.skills.model.JobProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobProfileRepository extends JpaRepository<JobProfile, Long> {

    Optional<JobProfile> findByName(String name);

    boolean existsByName(String name);
}
