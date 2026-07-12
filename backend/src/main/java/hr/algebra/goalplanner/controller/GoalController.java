package hr.algebra.goalplanner.controller;

import hr.algebra.goalplanner.dto.GoalRequest;
import hr.algebra.goalplanner.dto.GoalResponse;
import hr.algebra.goalplanner.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping(params = "scenarioId")
    public List<GoalResponse> getByScenario(@RequestParam Long scenarioId) {
        return goalService.getByScenario(scenarioId).stream()
                .map(GoalResponse::from).toList();
    }

    @GetMapping("/{id}")
    public GoalResponse getOne(@PathVariable Long id) {
        return GoalResponse.from(goalService.getById(id));
    }

    @PostMapping
    public GoalResponse create(@RequestBody GoalRequest request) {
        return GoalResponse.from(goalService.create(request));
    }

    @PutMapping("/{id}")
    public GoalResponse update(@PathVariable Long id, @RequestBody GoalRequest request) {
        return GoalResponse.from(goalService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        goalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}