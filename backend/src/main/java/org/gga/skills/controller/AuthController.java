package org.gga.skills.controller;

import org.gga.skills.dto.CurrentUser;
import org.gga.skills.dto.CurrentUserResponse;
import org.gga.skills.service.CurrentUserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CurrentUserService currentUserService;

    public AuthController(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @GetMapping("/me")
    public CurrentUserResponse getCurrentUser() {
        CurrentUser user = currentUserService.getCurrentUser();
        return new CurrentUserResponse(
                user.employee().getEmail(),
                user.employee().getFirstName(),
                user.employee().getLastName(),
                user.role().name()
        );
    }
}
