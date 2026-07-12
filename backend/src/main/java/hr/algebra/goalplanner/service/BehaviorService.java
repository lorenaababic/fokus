package hr.algebra.goalplanner.service;

import hr.algebra.goalplanner.dto.BehaviorRequest;
import hr.algebra.goalplanner.model.Behavior;
import hr.algebra.goalplanner.model.Goal;
import hr.algebra.goalplanner.repository.BehaviorRepository;
import hr.algebra.goalplanner.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BehaviorService {

    private final BehaviorRepository behaviorRepository;
    private final GoalService goalService;
    private final CurrentUserService currentUserService;

    public List<Behavior> getByGoal(Long goalId) {
        goalService.getById(goalId);
        return behaviorRepository.findByGoalId(goalId);
    }

    public Behavior getById(Long id) {
        Behavior behavior = behaviorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Behavior not found"));
        goalService.getById(behavior.getGoal().getId());
        return behavior;
    }

    public List<Behavior> getAllMine() {
        return behaviorRepository.findByGoalScenarioUserId(
                currentUserService.getCurrentUser().getId());
    }

    public Behavior create(BehaviorRequest request) {
        Goal goal = goalService.getById(request.goalId());

        Behavior behavior = new Behavior();
        behavior.setGoal(goal);
        behavior.setTitle(request.title());
        behavior.setFrequency(request.frequency());
        behavior.setTargetCount(request.targetCount());

        return behaviorRepository.save(behavior);
    }

    public Behavior update(Long id, BehaviorRequest request) {
        Behavior behavior = getById(id);
        behavior.setTitle(request.title());
        behavior.setFrequency(request.frequency());
        behavior.setTargetCount(request.targetCount());
        return behaviorRepository.save(behavior);
    }

    public void delete(Long id) {
        behaviorRepository.delete(getById(id));
    }
}