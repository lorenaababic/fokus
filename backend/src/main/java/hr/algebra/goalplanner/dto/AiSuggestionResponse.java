package hr.algebra.goalplanner.dto;

public record AiSuggestionResponse(
        String title,
        String frequency,
        Integer targetCount
) {}