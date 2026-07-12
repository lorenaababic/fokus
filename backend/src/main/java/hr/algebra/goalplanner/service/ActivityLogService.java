package hr.algebra.goalplanner.service;

import hr.algebra.goalplanner.dto.ActivityLogRequest;
import hr.algebra.goalplanner.model.ActivityLog;
import hr.algebra.goalplanner.model.Behavior;
import hr.algebra.goalplanner.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final BehaviorService behaviorService;

    public List<ActivityLog> getByBehavior(Long behaviorId, LocalDate from, LocalDate to) {
        behaviorService.getById(behaviorId);
        return activityLogRepository.findByBehaviorIdAndDateBetween(behaviorId, from, to);
    }

    public ActivityLog create(ActivityLogRequest request) {
        Behavior behavior = behaviorService.getById(request.behaviorId());

        ActivityLog log = new ActivityLog();
        log.setBehavior(behavior);
        log.setDate(request.date());
        log.setCompleted(request.completed());
        log.setNote(request.note());

        return activityLogRepository.save(log);
    }

    public ActivityLog update(Long id, ActivityLogRequest request) {
        ActivityLog log = activityLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Log not found"));
        behaviorService.getById(log.getBehavior().getId());
        log.setCompleted(request.completed());
        log.setNote(request.note());
        return activityLogRepository.save(log);
    }

    public void delete(Long id) {
        ActivityLog log = activityLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Log not found"));
        behaviorService.getById(log.getBehavior().getId());
        activityLogRepository.delete(log);
    }
}