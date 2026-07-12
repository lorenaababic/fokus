package hr.algebra.goalplanner.dto;

import hr.algebra.goalplanner.model.Scenario;

import java.time.LocalDate;

public record ScenarioResponse(
        Long id,
        String title,
        String description,
        Scenario.TimeFrame timeFrame,
        LocalDate startDate,
        LocalDate targetDate,
        Scenario.ScenarioStatus status
) {
    public static ScenarioResponse from(Scenario s) {
        return new ScenarioResponse(s.getId(), s.getTitle(), s.getDescription(),
                s.getTimeFrame(), s.getStartDate(), s.getTargetDate(), s.getStatus());
    }
}