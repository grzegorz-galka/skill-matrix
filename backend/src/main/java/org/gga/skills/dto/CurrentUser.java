package org.gga.skills.dto;

import org.gga.skills.model.Employee;
import org.gga.skills.model.Role;

public record CurrentUser(Employee employee, Role role) {}
