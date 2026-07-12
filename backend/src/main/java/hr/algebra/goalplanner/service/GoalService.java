package hr.algebra.goalplanner.service;

import hr.algebra.goalplanner.dto.GoalRequest;
import hr.algebra.goalplanner.model.Goal;
import hr.algebra.goalplanner.model.Scenario;
import hr.algebra.goalplanner.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final ScenarioService scenarioService;

    public List<Goal> getByScenario(Long scenarioId) {
        scenarioService.getById(scenarioId); // provjera vlasništva
        return goalRepository.findByScenarioId(scenarioId);
    }

    public Goal getById(Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        scenarioService.getById(goal.getScenario().getId()); // provjera vlasništva
        return goal;
    }

    public Goal create(GoalRequest request) {
        Scenario scenario = scenarioService.getById(request.scenarioId());

        Goal goal = new Goal();
        goal.setScenario(scenario);
        goal.setTitle(request.title());
        goal.setDescription(request.description());
        goal.setCategory(request.category());
        goal.setTargetValue(request.targetValue());
        goal.setTargetUnit(request.targetUnit());

        return goalRepository.save(goal);
    }

    public Goal update(Long id, GoalRequest request) {
        Goal goal = getById(id);
        goal.setTitle(request.title());
        goal.setDescription(request.description());
        goal.setCategory(request.category());
        goal.setTargetValue(request.targetValue());
        goal.setTargetUnit(request.targetUnit());
        return goalRepository.save(goal);
    }

    public void delete(Long id) {
        goalRepository.delete(getById(id));
    }
}