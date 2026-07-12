package hr.algebra.goalplanner.controller;

import hr.algebra.goalplanner.dto.AiImageRequest;
import hr.algebra.goalplanner.dto.AiSuggestionResponse;
import hr.algebra.goalplanner.dto.VisionBoardItemResponse;
import hr.algebra.goalplanner.model.Goal;
import hr.algebra.goalplanner.service.AiService;
import hr.algebra.goalplanner.service.GoalService;
import hr.algebra.goalplanner.service.VisionBoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final GoalService goalService;
    private final VisionBoardService visionBoardService;

    @PostMapping("/behavior-suggestions/{goalId}")
    public List<AiSuggestionResponse> suggestBehaviors(@PathVariable Long goalId) {
        Goal goal = goalService.getById(goalId); // ujedno provjera vlasništva
        return aiService.suggestBehaviors(goal.getTitle(), goal.getDescription(), goal.getCategory());
    }

    @PostMapping("/vision-image")
    public VisionBoardItemResponse generateVisionImage(@RequestBody AiImageRequest request) throws IOException {
        byte[] image = aiService.generateImage(request.prompt());
        return VisionBoardItemResponse.from(
                visionBoardService.addGeneratedItem(
                        request.scenarioId(), request.goalId(), request.prompt(), image));
    }
}