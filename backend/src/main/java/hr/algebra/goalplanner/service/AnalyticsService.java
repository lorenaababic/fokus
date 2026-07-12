package hr.algebra.goalplanner.service;

import hr.algebra.goalplanner.dto.BehaviorTimelineResponse;
import hr.algebra.goalplanner.dto.ScenarioProgressResponse;
import hr.algebra.goalplanner.model.ActivityLog;
import hr.algebra.goalplanner.model.Behavior;
import hr.algebra.goalplanner.model.Goal;
import hr.algebra.goalplanner.model.Scenario;
import hr.algebra.goalplanner.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ScenarioService scenarioService;
    private final BehaviorService behaviorService;
    private final ActivityLogRepository activityLogRepository;

    @Transactional(readOnly = true)
    public ScenarioProgressResponse getScenarioProgress(Long scenarioId) {
        Scenario scenario = scenarioService.getById(scenarioId);
        LocalDate start = scenario.getStartDate();
        LocalDate end = earliest(LocalDate.now(), scenario.getTargetDate());

        List<ScenarioProgressResponse.GoalProgress> goalProgressList = new ArrayList<>();
        double scenarioRateSum = 0;
        int behaviorTotal = 0;

        for (Goal goal : scenario.getGoals()) {
            List<ScenarioProgressResponse.BehaviorProgress> behaviorProgressList = new ArrayList<>();
            double goalRateSum = 0;

            for (Behavior behavior : goal.getBehaviors()) {
                long expected = expectedCount(behavior, start, end);
                long actual = countCompleted(behavior.getId(), start, end);
                double rate = expected == 0 ? 0 : Math.min(100.0, actual * 100.0 / expected);
                double deviation = rate - 100.0;

                behaviorProgressList.add(new ScenarioProgressResponse.BehaviorProgress(
                        behavior.getId(), behavior.getTitle(), expected, actual,
                        round(rate), round(deviation)));

                goalRateSum += rate;
                scenarioRateSum += rate;
                behaviorTotal++;
            }

            double goalRate = behaviorProgressList.isEmpty() ? 0
                    : goalRateSum / behaviorProgressList.size();
            goalProgressList.add(new ScenarioProgressResponse.GoalProgress(
                    goal.getId(), goal.getTitle(), round(goalRate), behaviorProgressList));
        }

        double overall = behaviorTotal == 0 ? 0 : scenarioRateSum / behaviorTotal;
        return new ScenarioProgressResponse(
                scenario.getId(), scenario.getTitle(), round(overall), goalProgressList);
    }

    @Transactional(readOnly = true)
    public BehaviorTimelineResponse getBehaviorTimeline(Long behaviorId, LocalDate from, LocalDate to) {
        Behavior behavior = behaviorService.getById(behaviorId);

        List<BehaviorTimelineResponse.WeekPoint> weeks = new ArrayList<>();
        LocalDate weekStart = from.with(DayOfWeek.MONDAY);

        while (!weekStart.isAfter(to)) {
            LocalDate weekEnd = weekStart.plusDays(6);
            long expected = expectedCount(behavior, weekStart, earliest(weekEnd, to));
            long actual = countCompleted(behaviorId, weekStart, weekEnd);
            weeks.add(new BehaviorTimelineResponse.WeekPoint(weekStart, expected, actual));
            weekStart = weekStart.plusWeeks(1);
        }

        return new BehaviorTimelineResponse(behavior.getId(), behavior.getTitle(), weeks);
    }

    private long expectedCount(Behavior behavior, LocalDate from, LocalDate to) {
        if (to.isBefore(from)) return 0;
        long days = ChronoUnit.DAYS.between(from, to) + 1;
        return switch (behavior.getFrequency()) {
            case DAILY -> days * behavior.getTargetCount();
            case WEEKLY -> Math.max(1, days / 7) * behavior.getTargetCount();
        };
    }

    private long countCompleted(Long behaviorId, LocalDate from, LocalDate to) {
        return activityLogRepository.findByBehaviorIdAndDateBetween(behaviorId, from, to)
                .stream().filter(ActivityLog::isCompleted).count();
    }

    private LocalDate earliest(LocalDate a, LocalDate b) {
        return a.isBefore(b) ? a : b;
    }

    private double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}