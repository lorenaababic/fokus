package hr.algebra.goalplanner.dto;

import hr.algebra.goalplanner.model.Goal;

public record GoalResponse(
        Long id,
        Long scenarioId,
        String title,
        String description,
        String category,
        Double targetValue,
        String targetUnit
) {
    public static GoalResponse from(Goal g) {
        return new GoalResponse(g.getId(), g.getScenario().getId(), g.getTitle(),
                g.getDescription(), g.getCategory(), g.getTargetValue(), g.getTargetUnit());
    }
}