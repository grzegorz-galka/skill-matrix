package org.gga.skills.service;

import org.gga.skills.dto.DevLoginResponse;
import org.gga.skills.model.Employee;
import org.gga.skills.model.Role;
import org.gga.skills.repository.EmployeeRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@Profile("dev")
public class DevAuthService {

    private final JwtEncoder jwtEncoder;
    private final EmployeeRepository employeeRepository;
    private final AuthorizationService authorizationService;

    public DevAuthService(JwtEncoder jwtEncoder,
                          EmployeeRepository employeeRepository,
                          AuthorizationService authorizationService) {
        this.jwtEncoder = jwtEncoder;
        this.employeeRepository = employeeRepository;
        this.authorizationService = authorizationService;
    }

    public DevLoginResponse login(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("No employee record for email: " + email));

        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("skill-matrix-dev")
                .subject(employee.getEmail())
                .claim("email", employee.getEmail())
                .issuedAt(now)
                .expiresAt(now.plus(8, ChronoUnit.HOURS))
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        Role role = authorizationService.resolveRole(email);

        return new DevLoginResponse(token, employee.getEmail(), role.name());
    }
}
