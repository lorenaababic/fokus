package hr.algebra.goalplanner.dto;

import java.time.LocalDate;
import java.util.List;

public record BehaviorTimelineResponse(
        Long behaviorId,
        String behaviorTitle,
        List<WeekPoint> weeks
) {
    public record WeekPoint(
            LocalDate weekStart,
            long expected,
            long actual
    ) {}
}