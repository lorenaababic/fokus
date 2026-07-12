package hr.algebra.goalplanner.controller;

import hr.algebra.goalplanner.dto.BehaviorRequest;
import hr.algebra.goalplanner.dto.BehaviorResponse;
import hr.algebra.goalplanner.service.BehaviorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/behaviors")
@RequiredArgsConstructor
public class BehaviorController {

    private final BehaviorService behaviorService;

    @GetMapping(params = "goalId")
    public List<BehaviorResponse> getByGoal(@RequestParam Long goalId) {
        return behaviorService.getByGoal(goalId).stream()
                .map(BehaviorResponse::from).toList();
    }

    @GetMapping("/mine")
    public List<BehaviorResponse> getAllMine() {
        return behaviorService.getAllMine().stream()
                .map(BehaviorResponse::from).toList();
    }

    @PostMapping
    public BehaviorResponse create(@RequestBody BehaviorRequest request) {
        return BehaviorResponse.from(behaviorService.create(request));
    }

    @PutMapping("/{id}")
    public BehaviorResponse update(@PathVariable Long id, @RequestBody BehaviorRequest request) {
        return BehaviorResponse.from(behaviorService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        behaviorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}