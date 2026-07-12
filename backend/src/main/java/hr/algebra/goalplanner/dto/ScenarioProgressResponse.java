package hr.algebra.goalplanner.dto;

import java.util.List;

public record ScenarioProgressResponse(
        Long scenarioId,
        String scenarioTitle,
        double overallCompletionRate,
        List<GoalProgress> goals
) {
    public record GoalProgress(
            Long goalId,
            String goalTitle,
            double completionRate,
            List<BehaviorProgress> behaviors
    ) {}

    public record BehaviorProgress(
            Long behaviorId,
            String behaviorTitle,
            long expectedCount,
            long actualCount,
            double completionRate,
            double deviation
    ) {}
}