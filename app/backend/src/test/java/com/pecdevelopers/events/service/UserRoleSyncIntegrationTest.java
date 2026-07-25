package com.pecdevelopers.events.service;

import com.pecdevelopers.events.model.entity.Role;
import com.pecdevelopers.events.model.entity.User;
import com.pecdevelopers.events.repository.RoleRepository;
import com.pecdevelopers.events.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class UserRoleSyncIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Test
    public void testRoleSync_OnPersistAndUpdate() {
        // 1. Create and save a Role
        Role adminRole = roleRepository.save(Role.builder()
                .name("ADMIN")
                .build());

        // 2. Create a User referencing the Role entity but with a null role name string
        User user = User.builder()
                .id(UUID.randomUUID())
                .name("Test User")
                .email("testuser@pec.edu")
                .roleEntity(adminRole)
                .build();

        // 3. Save the User
        User savedUser = userRepository.saveAndFlush(user);

        // 4. Verify that the flat string "role" field was automatically populated via the PrePersist hook
        assertThat(savedUser.getRole()).isEqualTo("ADMIN");

        // 5. Update the User's role to a different one
        Role studentRole = roleRepository.save(Role.builder()
                .name("STUDENT")
                .build());
        
        savedUser.setRoleEntity(studentRole);
        User updatedUser = userRepository.saveAndFlush(savedUser);

        // 6. Verify that the flat string "role" field was automatically updated via the PreUpdate hook
        assertThat(updatedUser.getRole()).isEqualTo("STUDENT");
    }
}
