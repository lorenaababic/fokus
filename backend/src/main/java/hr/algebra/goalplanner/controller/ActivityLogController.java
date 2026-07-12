package hr.algebra.goalplanner.controller;

import hr.algebra.goalplanner.dto.ActivityLogRequest;
import hr.algebra.goalplanner.dto.ActivityLogResponse;
import hr.algebra.goalplanner.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public List<ActivityLogResponse> getByBehavior(
            @RequestParam Long behaviorId,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to) {
        return activityLogService.getByBehavior(behaviorId, from, to).stream()
                .map(ActivityLogResponse::from).toList();
    }

    @PostMapping
    public ActivityLogResponse create(@RequestBody ActivityLogRequest request) {
        return ActivityLogResponse.from(activityLogService.create(request));
    }

    @PutMapping("/{id}")
    public ActivityLogResponse update(@PathVariable Long id, @RequestBody ActivityLogRequest request) {
        return ActivityLogResponse.from(activityLogService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        activityLogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}