package org.gga.skills.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

class GlobMatcherTest {

    @ParameterizedTest
    @CsvSource({
            "hello, hello, true",
            "hello, HELLO, true",
            "CKI-P, CKI-P, true",
            "CKI-IT-Dev, CKI-IT*, true",
            "CKI-P, CKI-IT*, false",
            "Java Programming, *Java*, true",
            "Python, *Java*, false",
            "jak.kowalski@company.com, jak.kowalski*, true",
            "anna.galka@company.com, *galka*, true",
            "john@company.com, *galka*, false",
            "'', hello, false",
    })
    void matches_WithVariousPatterns(String value, String pattern, boolean expected) {
        assertThat(GlobMatcher.matches(value, pattern)).isEqualTo(expected);
    }

    @Test
    void matches_WithNullValue_ReturnsFalse() {
        assertThat(GlobMatcher.matches(null, "pattern")).isFalse();
    }

    @Test
    void matches_WithNullPattern_ReturnsFalse() {
        assertThat(GlobMatcher.matches("value", null)).isFalse();
    }

    @Test
    void matches_WithQuestionMarkWildcard() {
        assertThat(GlobMatcher.matches("cat", "c?t")).isTrue();
        assertThat(GlobMatcher.matches("cut", "c?t")).isTrue();
        assertThat(GlobMatcher.matches("cart", "c?t")).isFalse();
    }
}
