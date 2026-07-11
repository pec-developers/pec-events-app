package com.pecdevelopers.events.aspect;

import com.pecdevelopers.events.annotation.RequiresRole;
import com.pecdevelopers.events.service.RoleService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.reflect.MethodSignature;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RoleCheckAspectTest {

    @Mock
    private RoleService roleService;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private RoleCheckAspect roleCheckAspect;

    private AutoCloseable mockCloseable;

    @BeforeEach
    void setUp() {
        mockCloseable = MockitoAnnotations.openMocks(this);
        ServletRequestAttributes attributes = new ServletRequestAttributes(request);
        RequestContextHolder.setRequestAttributes(attributes);
    }

    @AfterEach
    void tearDown() throws Exception {
        RequestContextHolder.resetRequestAttributes();
        mockCloseable.close();
    }

    private JoinPoint mockJoinPoint(RequiresRole annotation) {
        JoinPoint joinPoint = mock(JoinPoint.class);
        MethodSignature signature = mock(MethodSignature.class);
        Method method = mock(Method.class);

        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getMethod()).thenReturn(method);
        when(method.getAnnotation(RequiresRole.class)).thenReturn(annotation);

        return joinPoint;
    }

    @Test
    void checkRole_whenRoleMatches_shouldSucceed() {
        // Arrange
        RequiresRole annotation = mock(RequiresRole.class);
        when(annotation.value()).thenReturn(new String[] { "admin" });
        when(request.getAttribute("userId")).thenReturn("user-123");
        when(roleService.getRoleForUser("user-123")).thenReturn("admin");

        JoinPoint jp = mockJoinPoint(annotation);

        // Act & Assert
        roleCheckAspect.checkRole(jp);
    }

    @Test
    void checkRole_whenRoleMismatches_shouldThrowForbidden() {
        // Arrange
        RequiresRole annotation = mock(RequiresRole.class);
        when(annotation.value()).thenReturn(new String[] { "admin" });
        when(request.getAttribute("userId")).thenReturn("user-123");
        when(roleService.getRoleForUser("user-123")).thenReturn("student");

        JoinPoint jp = mockJoinPoint(annotation);

        // Act & Assert
        assertThatThrownBy(() -> roleCheckAspect.checkRole(jp))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(rse.getReason()).contains("Required role(s): [admin]");
                });
    }

    @Test
    void checkRole_whenNoUserInRequest_shouldThrowUnauthorized() {
        // Arrange
        RequiresRole annotation = mock(RequiresRole.class);
        when(annotation.value()).thenReturn(new String[] { "student" });
        when(request.getAttribute("userId")).thenReturn(null);

        JoinPoint jp = mockJoinPoint(annotation);

        // Act & Assert
        assertThatThrownBy(() -> roleCheckAspect.checkRole(jp))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
                });
    }
}
