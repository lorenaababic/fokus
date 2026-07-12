package hr.algebra.goalplanner.service;

import hr.algebra.goalplanner.dto.ScenarioRequest;
import hr.algebra.goalplanner.model.Scenario;
import hr.algebra.goalplanner.model.User;
import hr.algebra.goalplanner.repository.ScenarioRepository;
import hr.algebra.goalplanner.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScenarioService {

    private final ScenarioRepository scenarioRepository;
    private final CurrentUserService currentUserService;

    public List<Scenario> getMyScenarios() {
        User user = currentUserService.getCurrentUser();
        return scenarioRepository.findByUserId(user.getId());
    }

    public Scenario getById(Long id) {
        Scenario scenario = scenarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Scenario not found"));
        checkOwnership(scenario);
        return scenario;
    }

    public Scenario create(ScenarioRequest request) {
        User user = currentUserService.getCurrentUser();

        Scenario scenario = new Scenario();
        scenario.setUser(user);
        scenario.setTitle(request.title());
        scenario.setDescription(request.description());
        scenario.setTimeFrame(request.timeFrame());
        scenario.setStartDate(request.startDate());
        scenario.setTargetDate(calculateTargetDate(request.startDate(), request.timeFrame()));

        return scenarioRepository.save(scenario);
    }

    public Scenario update(Long id, ScenarioRequest request) {
        Scenario scenario = getById(id);
        scenario.setTitle(request.title());
        scenario.setDescription(request.description());
        scenario.setTimeFrame(request.timeFrame());
        scenario.setStartDate(request.startDate());
        scenario.setTargetDate(calculateTargetDate(request.startDate(), request.timeFrame()));
        return scenarioRepository.save(scenario);
    }

    public void delete(Long id) {
        Scenario scenario = getById(id);
        scenarioRepository.delete(scenario);
    }

    private java.time.LocalDate calculateTargetDate(java.time.LocalDate start, Scenario.TimeFrame timeFrame) {
        return switch (timeFrame) {
            case THREE_MONTHS -> start.plusMonths(3);
            case SIX_MONTHS -> start.plusMonths(6);
            case ONE_YEAR -> start.plusYears(1);
        };
    }

    private void checkOwnership(Scenario scenario) {
        User user = currentUserService.getCurrentUser();
        if (!scenario.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied");
        }
    }
}