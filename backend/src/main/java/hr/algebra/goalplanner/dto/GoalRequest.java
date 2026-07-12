package hr.algebra.goalplanner.dto;

public record GoalRequest(
        Long scenarioId,
        String title,
        String description,
        String category,
        Double targetValue,
        String targetUnit
) {}