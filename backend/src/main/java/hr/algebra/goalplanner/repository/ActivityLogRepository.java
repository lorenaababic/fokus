package hr.algebra.goalplanner.repository;

import hr.algebra.goalplanner.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByBehaviorIdAndDateBetween(Long behaviorId, LocalDate from, LocalDate to);
}