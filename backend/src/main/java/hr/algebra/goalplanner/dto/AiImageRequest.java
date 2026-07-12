package hr.algebra.goalplanner.dto;

public record AiImageRequest(
        Long scenarioId,
        Long goalId,
        String prompt
) {}