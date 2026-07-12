package hr.algebra.goalplanner.service;

import hr.algebra.goalplanner.model.Goal;
import hr.algebra.goalplanner.model.Scenario;
import hr.algebra.goalplanner.model.VisionBoardItem;
import hr.algebra.goalplanner.repository.VisionBoardItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VisionBoardService {

    private final VisionBoardItemRepository repository;
    private final ScenarioService scenarioService;
    private final GoalService goalService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public List<VisionBoardItem> getByScenario(Long scenarioId) {
        scenarioService.getById(scenarioId);
        return repository.findByScenarioIdOrderByPosition(scenarioId);
    }

    public VisionBoardItem addItem(Long scenarioId, Long goalId, String caption,
                                   MultipartFile image) throws IOException {
        Scenario scenario = scenarioService.getById(scenarioId);

        String extension = getExtension(image.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        Files.copy(image.getInputStream(), dir.resolve(filename));

        VisionBoardItem item = new VisionBoardItem();
        item.setScenario(scenario);
        if (goalId != null) {
            Goal goal = goalService.getById(goalId);
            item.setGoal(goal);
        }
        item.setImagePath(uploadDir + "/" + filename);
        item.setCaption(caption);
        item.setPosition((int) repository.count());

        return repository.save(item);
    }

    public VisionBoardItem addGeneratedItem(Long scenarioId, Long goalId, String caption,
                                            byte[] imageBytes) throws IOException {
        Scenario scenario = scenarioService.getById(scenarioId);

        String filename = UUID.randomUUID() + ".png";
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        Files.write(dir.resolve(filename), imageBytes);

        VisionBoardItem item = new VisionBoardItem();
        item.setScenario(scenario);
        if (goalId != null) {
            item.setGoal(goalService.getById(goalId));
        }
        item.setImagePath(uploadDir + "/" + filename);
        item.setCaption(caption);
        item.setPosition((int) repository.count());

        return repository.save(item);
    }

    public void delete(Long id) throws IOException {
        VisionBoardItem item = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        scenarioService.getById(item.getScenario().getId());
        Files.deleteIfExists(Paths.get(item.getImagePath()));
        repository.delete(item);
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}