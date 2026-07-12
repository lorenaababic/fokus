package hr.algebra.goalplanner.repository;

import hr.algebra.goalplanner.model.VisionBoardItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VisionBoardItemRepository extends JpaRepository<VisionBoardItem, Long> {
    List<VisionBoardItem> findByScenarioIdOrderByPosition(Long scenarioId);
}