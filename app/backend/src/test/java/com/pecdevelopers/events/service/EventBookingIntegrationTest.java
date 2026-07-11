package com.pecdevelopers.events.service;

import com.pecdevelopers.events.model.entity.Event;
import com.pecdevelopers.events.model.entity.Registration;
import com.pecdevelopers.events.model.entity.User;
import com.pecdevelopers.events.repository.EventRepository;
import com.pecdevelopers.events.repository.RegistrationRepository;
import com.pecdevelopers.events.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class EventBookingIntegrationTest {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Test
    public void testConcurrentBookingSlotLock_PreventsOverselling() throws Exception {
        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        
        UUID eventId = tx.execute(status -> {
            User creator = userRepository.save(User.builder()
                    .id(UUID.randomUUID())
                    .name("Organizer")
                    .email("organizer@pec.edu")
                    .role("FACULTY_COORDINATOR")
                    .build());

            Event event = eventRepository.save(Event.builder()
                    .title("Web3 Seminar")
                    .capacity(2)
                    .price(BigDecimal.ZERO)
                    .active(true)
                    .creator(creator)
                    .date(LocalDateTime.now().plusDays(2))
                    .build());
            return event.getId();
        });

        List<UUID> userIds = tx.execute(status -> {
            List<UUID> ids = new ArrayList<>();
            for (int i = 1; i <= 5; i++) {
                User u = userRepository.save(User.builder()
                        .id(UUID.randomUUID())
                        .name("Student " + i)
                        .email("student" + i + "@pec.edu")
                        .role("STUDENT")
                        .build());
                ids.add(u.getId());
            }
            return ids;
        });

        ExecutorService executor = Executors.newFixedThreadPool(5);
        List<Future<Boolean>> futures = new ArrayList<>();

        for (UUID userId : userIds) {
            futures.add(executor.submit(() -> {
                return tx.execute(status -> {
                    Event event = eventRepository.findByIdForUpdate(eventId)
                            .orElseThrow();

                    long currentBookings = registrationRepository.countByEventIdAndStatusIn(
                            eventId, List.of("CONFIRMED", "PENDING_PAYMENT")
                    );

                    if (currentBookings < event.getCapacity()) {
                        User student = userRepository.findById(userId).orElseThrow();
                        registrationRepository.save(Registration.builder()
                                .event(event)
                                .student(student)
                                .status("CONFIRMED")
                                .build());
                        return true;
                    }
                    return false;
                });
            }));
        }

        int successCount = 0;
        for (Future<Boolean> f : futures) {
            if (f.get()) {
                successCount++;
            }
        }
        executor.shutdown();

        assertThat(successCount).isLessThanOrEqualTo(2);
        
        long totalRegistrations = registrationRepository.countByEventIdAndStatusIn(
                eventId, List.of("CONFIRMED")
        );
        assertThat(totalRegistrations).isEqualTo(2);
    }
}
