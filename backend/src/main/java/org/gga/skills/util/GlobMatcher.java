package org.gga.skills.util;

public final class GlobMatcher {

    private GlobMatcher() {}

    public static boolean matches(String value, String pattern) {
        if (value == null || pattern == null) {
            return false;
        }
        String regex = pattern.toLowerCase()
                .replace(".", "\\.")
                .replace("*", ".*")
                .replace("?", ".");
        return value.toLowerCase().matches(regex);
    }
}
