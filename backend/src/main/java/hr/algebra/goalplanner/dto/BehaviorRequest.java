package hr.algebra.goalplanner.dto;

import hr.algebra.goalplanner.model.Behavior;

public record BehaviorRequest(
        Long goalId,
        String title,
        Behavior.Frequency frequency,
        Integer targetCount
) {}