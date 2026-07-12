package hr.algebra.goalplanner.dto;

import hr.algebra.goalplanner.model.ActivityLog;

import java.time.LocalDate;

public record ActivityLogResponse(
        Long id,
        Long behaviorId,
        LocalDate date,
        boolean completed,
        String note
) {
    public static ActivityLogResponse from(ActivityLog a) {
        return new ActivityLogResponse(a.getId(), a.getBehavior().getId(),
                a.getDate(), a.isCompleted(), a.getNote());
    }
}