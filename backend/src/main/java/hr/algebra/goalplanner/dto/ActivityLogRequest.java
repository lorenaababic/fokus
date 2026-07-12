package hr.algebra.goalplanner.dto;

import java.time.LocalDate;

public record ActivityLogRequest(
        Long behaviorId,
        LocalDate date,
        boolean completed,
        String note
) {}