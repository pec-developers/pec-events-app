package com.pecdevelopers.events.service.port;

import com.pecdevelopers.events.model.entity.SystemConfiguration;
import com.pecdevelopers.events.model.enums.SystemConfigKey;
import java.util.List;

public interface SystemConfigurationServicePort {
    int getConfigurationValue(SystemConfigKey key);
    void updateConfigurationValue(SystemConfigKey key, int value);
    List<SystemConfiguration> getAllConfigurations();
}
