package hr.algebra.goalplanner.dto;

import hr.algebra.goalplanner.model.Behavior;

public record BehaviorResponse(
        Long id,
        Long goalId,
        String title,
        Behavior.Frequency frequency,
        Integer targetCount
) {
    public static BehaviorResponse from(Behavior b) {
        return new BehaviorResponse(b.getId(), b.getGoal().getId(), b.getTitle(),
                b.getFrequency(), b.getTargetCount());
    }
}