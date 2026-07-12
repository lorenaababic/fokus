package hr.algebra.goalplanner.repository;

import hr.algebra.goalplanner.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByScenarioId(Long scenarioId);
}