package hr.algebra.goalplanner.service;

import hr.algebra.goalplanner.dto.ScenarioProgressResponse;
import hr.algebra.goalplanner.model.ActivityLog;
import hr.algebra.goalplanner.model.Behavior;
import hr.algebra.goalplanner.model.Goal;
import hr.algebra.goalplanner.model.Scenario;
import hr.algebra.goalplanner.repository.ActivityLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private ScenarioService scenarioService;

    @Mock
    private BehaviorService behaviorService;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private Scenario scenario;
    private Behavior behavior;

    @BeforeEach
    void setUp() {
        // Given
        scenario = new Scenario();
        scenario.setId(1L);
        scenario.setTitle("Zdraviji život");
        scenario.setStartDate(LocalDate.now().minusDays(13));
        scenario.setTargetDate(LocalDate.now().plusMonths(3));

        Goal goal = new Goal();
        goal.setId(1L);
        goal.setTitle("Istrčati 10km");
        goal.setScenario(scenario);

        behavior = new Behavior();
        behavior.setId(1L);
        behavior.setTitle("Trčanje");
        behavior.setFrequency(Behavior.Frequency.WEEKLY);
        behavior.setTargetCount(3);
        behavior.setGoal(goal);

        goal.getBehaviors().add(behavior);
        scenario.getGoals().add(goal);
    }

    @Test
    @DisplayName("Izračun napretka: 3 od 6 očekivanih izvršenja daje 50%")
    void scenarioProgress_halfCompleted_returns50Percent() {
        // Given
        when(scenarioService.getById(1L)).thenReturn(scenario);
        when(activityLogRepository.findByBehaviorIdAndDateBetween(eq(1L), any(), any()))
                .thenReturn(List.of(
                        completedLog(1), completedLog(3), completedLog(8)));

        // When
        ScenarioProgressResponse result = analyticsService.getScenarioProgress(1L);

        // Then
        assertThat(result.overallCompletionRate()).isEqualTo(50.0);
        ScenarioProgressResponse.BehaviorProgress bp =
                result.goals().get(0).behaviors().get(0);
        assertThat(bp.expectedCount()).isEqualTo(6);
        assertThat(bp.actualCount()).isEqualTo(3);
        assertThat(bp.deviation()).isEqualTo(-50.0);
    }

    @Test
    @DisplayName("Izračun napretka: sva izvršenja odrađena daje 100% i odstupanje 0")
    void scenarioProgress_allCompleted_returns100Percent() {
        // Given
        when(scenarioService.getById(1L)).thenReturn(scenario);
        when(activityLogRepository.findByBehaviorIdAndDateBetween(eq(1L), any(), any()))
                .thenReturn(List.of(
                        completedLog(1), completedLog(2), completedLog(4),
                        completedLog(7), completedLog(9), completedLog(11)));

        // When
        ScenarioProgressResponse result = analyticsService.getScenarioProgress(1L);

        // Then
        assertThat(result.overallCompletionRate()).isEqualTo(100.0);
        assertThat(result.goals().get(0).behaviors().get(0).deviation()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Izračun napretka: bez zapisa daje 0%")
    void scenarioProgress_noLogs_returnsZero() {
        // Given
        when(scenarioService.getById(1L)).thenReturn(scenario);
        when(activityLogRepository.findByBehaviorIdAndDateBetween(eq(1L), any(), any()))
                .thenReturn(List.of());

        // When
        ScenarioProgressResponse result = analyticsService.getScenarioProgress(1L);

        // Then
        assertThat(result.overallCompletionRate()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Nezavršeni zapisi (completed=false) ne ulaze u izračun")
    void scenarioProgress_incompleteLogs_notCounted() {
        // Given
        ActivityLog notCompleted = completedLog(2);
        notCompleted.setCompleted(false);

        when(scenarioService.getById(1L)).thenReturn(scenario);
        when(activityLogRepository.findByBehaviorIdAndDateBetween(eq(1L), any(), any()))
                .thenReturn(List.of(completedLog(1), notCompleted));

        // When
        ScenarioProgressResponse result = analyticsService.getScenarioProgress(1L);

        // Then
        assertThat(result.goals().get(0).behaviors().get(0).actualCount()).isEqualTo(1);
    }

    private ActivityLog completedLog(int daysAgo) {
        ActivityLog log = new ActivityLog();
        log.setId((long) daysAgo);
        log.setBehavior(behavior);
        log.setDate(LocalDate.now().minusDays(daysAgo));
        log.setCompleted(true);
        return log;
    }
}