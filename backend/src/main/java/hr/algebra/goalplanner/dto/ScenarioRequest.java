package hr.algebra.goalplanner.dto;

import hr.algebra.goalplanner.model.Scenario;

import java.time.LocalDate;

public record ScenarioRequest(
        String title,
        String description,
        Scenario.TimeFrame timeFrame,
        LocalDate startDate
) {}