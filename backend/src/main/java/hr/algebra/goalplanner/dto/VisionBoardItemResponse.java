package hr.algebra.goalplanner.dto;

import hr.algebra.goalplanner.model.VisionBoardItem;

public record VisionBoardItemResponse(
        Long id,
        Long scenarioId,
        Long goalId,
        String imageUrl,
        String caption,
        Integer position
) {
    public static VisionBoardItemResponse from(VisionBoardItem item) {
        return new VisionBoardItemResponse(
                item.getId(),
                item.getScenario().getId(),
                item.getGoal() != null ? item.getGoal().getId() : null,
                "/" + item.getImagePath(),
                item.getCaption(),
                item.getPosition());
    }
}