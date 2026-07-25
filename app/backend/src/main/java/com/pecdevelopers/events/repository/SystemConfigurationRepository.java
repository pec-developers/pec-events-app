package com.pecdevelopers.events.repository;

import com.pecdevelopers.events.model.entity.SystemConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemConfigurationRepository extends JpaRepository<SystemConfiguration, String> {
}
