package com.pecdevelopers.events.aspect;

import com.pecdevelopers.events.annotation.RequiresRole;
import com.pecdevelopers.events.service.RoleService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Method;

@Aspect
@Component
@RequiredArgsConstructor
public class RoleCheckAspect {

    private final RoleService roleService;

    @Before("@within(com.pecdevelopers.events.annotation.RequiresRole) || @annotation(com.pecdevelopers.events.annotation.RequiresRole)")
    public void checkRole(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        // 1. Check method-level annotation first
        RequiresRole requiresRole = method.getAnnotation(RequiresRole.class);

        // 2. Fallback to class-level annotation
        if (requiresRole == null) {
            requiresRole = joinPoint.getTarget().getClass().getAnnotation(RequiresRole.class);
        }

        if (requiresRole == null) {
            return;
        }

        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No active request context found");
        }

        HttpServletRequest request = attrs.getRequest();
        String userId = (String) request.getAttribute("userId");

        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        String userRole = roleService.getRoleForUser(userId);

        boolean hasAccess = false;
        if (userRole != null) {
            for (String allowedRole : requiresRole.value()) {
                if (allowedRole.equalsIgnoreCase(userRole)) {
                    hasAccess = true;
                    break;
                }
            }
        }

        if (!hasAccess) {
            String requiredRoles = String.join(", ", requiresRole.value());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Access denied. Required role(s): [" + requiredRoles + "], actual role: " + (userRole != null ? userRole : "none"));
        }
    }
}
