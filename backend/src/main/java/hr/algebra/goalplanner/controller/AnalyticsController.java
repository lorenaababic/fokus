package hr.algebra.goalplanner.controller;

import hr.algebra.goalplanner.dto.BehaviorTimelineResponse;
import hr.algebra.goalplanner.dto.ScenarioProgressResponse;
import hr.algebra.goalplanner.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/scenarios/{id}/progress")
    public ScenarioProgressResponse getScenarioProgress(@PathVariable Long id) {
        return analyticsService.getScenarioProgress(id);
    }

    @GetMapping("/behaviors/{id}/timeline")
    public BehaviorTimelineResponse getBehaviorTimeline(
            @PathVariable Long id,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to) {
        return analyticsService.getBehaviorTimeline(id, from, to);
    }
}