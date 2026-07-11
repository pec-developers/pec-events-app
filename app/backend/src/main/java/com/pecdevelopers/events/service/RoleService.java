package com.pecdevelopers.events.service;

import com.pecdevelopers.events.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final UserRepository userRepository;

    @Cacheable(value = "userRoles", key = "#userId")
    public String getRoleForUser(String userId) {
        if (userId == null) {
            return null;
        }
        try {
            UUID userUuid = UUID.fromString(userId);
            return userRepository.findById(userUuid)
                    .map(user -> user.getRole().toLowerCase())
                    .orElse(null);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @CacheEvict(value = "userRoles", key = "#userId")
    public void evictRoleCache(String userId) {
        // Method body empty, CacheEvict handles cache clearing
    }
}
