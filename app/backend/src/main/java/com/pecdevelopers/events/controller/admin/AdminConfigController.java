package com.pecdevelopers.events.controller.admin;

import com.pecdevelopers.events.annotation.RequiresRole;
import com.pecdevelopers.events.model.entity.SystemConfiguration;
import com.pecdevelopers.events.model.enums.SystemConfigKey;
import com.pecdevelopers.events.service.port.SystemConfigurationServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/config")
@RequiresRole({"ADMIN"})
@RequiredArgsConstructor
public class AdminConfigController {

    private final SystemConfigurationServicePort configurationService;

    @GetMapping
    public ResponseEntity<List<SystemConfiguration>> getAllConfigs() {
        return ResponseEntity.ok(configurationService.getAllConfigurations());
    }

    @PutMapping("/{key}")
    public ResponseEntity<Void> updateConfig(
            @PathVariable SystemConfigKey key,
            @RequestBody ConfigUpdateRequest request) {
        configurationService.updateConfigurationValue(key, request.getValue());
        return ResponseEntity.ok().build();
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ConfigUpdateRequest {
        private int value;
    }
}
