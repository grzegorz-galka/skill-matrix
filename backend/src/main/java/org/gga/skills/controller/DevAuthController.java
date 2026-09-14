package org.gga.skills.controller;

import jakarta.validation.Valid;
import org.gga.skills.dto.DevLoginRequest;
import org.gga.skills.dto.DevLoginResponse;
import org.gga.skills.service.DevAuthService;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Profile("dev")
@RequestMapping("/api/auth")
public class DevAuthController {

    private final DevAuthService devAuthService;

    public DevAuthController(DevAuthService devAuthService) {
        this.devAuthService = devAuthService;
    }

    @PostMapping("/dev-login")
    public DevLoginResponse devLogin(@Valid @RequestBody DevLoginRequest request) {
        return devAuthService.login(request.email());
    }
}
