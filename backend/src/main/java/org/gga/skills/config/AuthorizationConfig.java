package org.gga.skills.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Configuration
public class AuthorizationConfig {

    public record ReviewerPermissions(
            List<String> departmentPatterns,
            List<String> profilePatterns,
            List<String> skillPatterns,
            List<String> emailPatterns
    ) {}

    public record ReviewerConfig(String email, ReviewerPermissions permissions) {}

    public record AuthorizationProperties(List<String> admins, List<ReviewerConfig> reviewers) {}

    @Bean
    public AuthorizationProperties authorizationProperties() {
        try (InputStream input = new ClassPathResource("authorization.yml").getInputStream()) {
            Yaml yaml = new Yaml();
            Map<String, Object> data = yaml.load(input);

            @SuppressWarnings("unchecked")
            List<String> admins = data.containsKey("admins")
                    ? (List<String>) data.get("admins")
                    : List.of();

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> reviewerMaps = data.containsKey("reviewers")
                    ? (List<Map<String, Object>>) data.get("reviewers")
                    : List.of();

            List<ReviewerConfig> reviewers = reviewerMaps.stream()
                    .map(this::parseReviewerConfig)
                    .toList();

            return new AuthorizationProperties(admins, reviewers);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load authorization.yml", e);
        }
    }

    @SuppressWarnings("unchecked")
    private ReviewerConfig parseReviewerConfig(Map<String, Object> map) {
        String email = (String) map.get("email");
        Map<String, Object> permsMap = map.containsKey("permissions")
                ? (Map<String, Object>) map.get("permissions")
                : Map.of();

        ReviewerPermissions permissions = new ReviewerPermissions(
                getStringList(permsMap, "department.patterns"),
                getStringList(permsMap, "profile.patterns"),
                getStringList(permsMap, "skill.patterns"),
                getStringList(permsMap, "email.patterns")
        );

        return new ReviewerConfig(email, permissions);
    }

    @SuppressWarnings("unchecked")
    private List<String> getStringList(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof List) {
            return (List<String>) value;
        }
        return List.of();
    }
}
