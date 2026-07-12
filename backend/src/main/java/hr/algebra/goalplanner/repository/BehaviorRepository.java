package hr.algebra.goalplanner.repository;

import hr.algebra.goalplanner.model.Behavior;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BehaviorRepository extends JpaRepository<Behavior, Long> {
    List<Behavior> findByGoalId(Long goalId);
    List<Behavior> findByGoalScenarioUserId(Long userId);
}