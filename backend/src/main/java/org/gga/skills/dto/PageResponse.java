package org.gga.skills.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Pagination envelope matching the documented API contract. Spring's own Page
 * serialization names the page index "number", which clients do not expect.
 */
public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages()
        );
    }
}
