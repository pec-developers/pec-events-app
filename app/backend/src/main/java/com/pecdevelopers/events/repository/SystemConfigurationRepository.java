package com.pecdevelopers.events.repository;

import com.pecdevelopers.events.model.entity.SystemConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SystemConfigurationRepository extends JpaRepository<SystemConfiguration, String> {
}
