package org.gga.skills.dto;

import org.gga.skills.model.Employee;

import java.time.LocalDateTime;

public record EmployeeResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    String department,
    String position,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static EmployeeResponse fromEntity(Employee employee) {
        return new EmployeeResponse(
            employee.getId(),
            employee.getFirstName(),
            employee.getLastName(),
            employee.getEmail(),
            employee.getDepartment(),
            employee.getPosition(),
            employee.getCreatedAt(),
            employee.getUpdatedAt()
        );
    }
}
