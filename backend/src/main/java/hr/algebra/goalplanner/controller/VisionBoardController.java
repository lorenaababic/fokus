package hr.algebra.goalplanner.controller;

import hr.algebra.goalplanner.dto.VisionBoardItemResponse;
import hr.algebra.goalplanner.service.VisionBoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/visionboard")
@RequiredArgsConstructor
public class VisionBoardController {

    private final VisionBoardService visionBoardService;

    @GetMapping(params = "scenarioId")
    public List<VisionBoardItemResponse> getByScenario(@RequestParam Long scenarioId) {
        return visionBoardService.getByScenario(scenarioId).stream()
                .map(VisionBoardItemResponse::from).toList();
    }

    @PostMapping
    public VisionBoardItemResponse addItem(
            @RequestParam Long scenarioId,
            @RequestParam(required = false) Long goalId,
            @RequestParam(required = false) String caption,
            @RequestParam("image") MultipartFile image) throws IOException {
        return VisionBoardItemResponse.from(
                visionBoardService.addItem(scenarioId, goalId, caption, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws IOException {
        visionBoardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}