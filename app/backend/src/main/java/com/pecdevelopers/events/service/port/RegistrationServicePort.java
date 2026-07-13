package com.pecdevelopers.events.service.port;

import com.pecdevelopers.events.model.entity.Registration;
import java.util.List;
import java.util.UUID;

public interface RegistrationServicePort {
    Registration registerStudent(UUID eventId, UUID studentId);
    void cancelRegistration(UUID registrationId, UUID studentId);
    List<Registration> listRegistrationsForEvent(UUID eventId, UUID requesterId);
    List<Registration> listMyRegistrations(UUID studentId);
}
