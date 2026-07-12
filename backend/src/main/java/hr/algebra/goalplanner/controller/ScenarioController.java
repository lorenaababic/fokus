package hr.algebra.goalplanner.controller;

import hr.algebra.goalplanner.dto.ScenarioRequest;
import hr.algebra.goalplanner.dto.ScenarioResponse;
import hr.algebra.goalplanner.service.ScenarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scenarios")
@RequiredArgsConstructor
public class ScenarioController {

    private final ScenarioService scenarioService;

    @GetMapping
    public List<ScenarioResponse> getAll() {
        return scenarioService.getMyScenarios().stream()
                .map(ScenarioResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ScenarioResponse getOne(@PathVariable Long id) {
        return ScenarioResponse.from(scenarioService.getById(id));
    }

    @PostMapping
    public ScenarioResponse create(@RequestBody ScenarioRequest request) {
        return ScenarioResponse.from(scenarioService.create(request));
    }

    @PutMapping("/{id}")
    public ScenarioResponse update(@PathVariable Long id, @RequestBody ScenarioRequest request) {
        return ScenarioResponse.from(scenarioService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scenarioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}