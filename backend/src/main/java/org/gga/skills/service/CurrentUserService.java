package org.gga.skills.service;

import org.gga.skills.dto.CurrentUser;
import org.gga.skills.model.Employee;
import org.gga.skills.model.Role;
import org.gga.skills.repository.EmployeeRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final EmployeeRepository employeeRepository;
    private final AuthorizationService authorizationService;

    public CurrentUserService(EmployeeRepository employeeRepository,
                              AuthorizationService authorizationService) {
        this.employeeRepository = employeeRepository;
        this.authorizationService = authorizationService;
    }

    public CurrentUser getCurrentUser() {
        String email = getCurrentEmail();
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("No employee record for email: " + email));
        Role role = authorizationService.resolveRole(email);
        return new CurrentUser(employee, role);
    }

    public String getCurrentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt)) {
            throw new AccessDeniedException("Not authenticated");
        }
        String email = jwt.getClaimAsString("email");
        if (email == null) {
            email = jwt.getSubject();
        }
        if (email == null) {
            throw new AccessDeniedException("No email claim in token");
        }
        return email;
    }
}
