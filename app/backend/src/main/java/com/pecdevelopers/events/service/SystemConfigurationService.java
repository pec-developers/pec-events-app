package com.pecdevelopers.events.service;

import com.pecdevelopers.events.model.entity.SystemConfiguration;
import com.pecdevelopers.events.model.enums.SystemConfigKey;
import com.pecdevelopers.events.repository.SystemConfigurationRepository;
import com.pecdevelopers.events.service.port.SystemConfigurationServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemConfigurationService implements SystemConfigurationServicePort {

    private final SystemConfigurationRepository repository;

    @Override
    public int getConfigurationValue(SystemConfigKey key) {
        return repository.findById(key.name())
                .map(SystemConfiguration::getValue)
                .orElse(key.getDefaultValue());
    }

    @Override
    @Transactional
    public void updateConfigurationValue(SystemConfigKey key, int value) {
        SystemConfiguration config = repository.findById(key.name())
                .orElseGet(() -> SystemConfiguration.builder()
                        .key(key.name())
                        .description(key.getDescription())
                        .build());
        config.setValue(value);
        config.setUpdatedAt(LocalDateTime.now());
        repository.save(config);
    }

    @Override
    public List<SystemConfiguration> getAllConfigurations() {
        // Ensure all enum keys are returned, using database values where present
        List<SystemConfiguration> dbConfigs = repository.findAll();
        for (SystemConfigKey key : SystemConfigKey.values()) {
            boolean exists = dbConfigs.stream().anyMatch(c -> c.getKey().equals(key.name()));
            if (!exists) {
                dbConfigs.add(SystemConfiguration.builder()
                        .key(key.name())
                        .value(key.getDefaultValue())
                        .description(key.getDescription())
                        .build());
            }
        }
        return dbConfigs;
    }
}
