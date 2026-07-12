package hr.algebra.goalplanner.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import hr.algebra.goalplanner.dto.AiSuggestionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String model;

    public AiService(@Value("${openai.api.key}") String apiKey,
                     @Value("${openai.model}") String model) {
        this.model = model;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    public List<AiSuggestionResponse> suggestBehaviors(String goalTitle, String description, String category) {
        String prompt = """
                Korisnik ima osobni cilj: "%s" (kategorija: %s). Opis: "%s".
                Predloži 3 do 5 konkretnih, mjerljivih ponašanja koja vode ostvarenju tog cilja.
                Odgovori ISKLJUČIVO čistim JSON nizom, bez markdowna, u formatu:
                [{"title":"...","frequency":"DAILY ili WEEKLY","targetCount":broj}]
                Naslovi ponašanja neka budu kratki i na hrvatskom jeziku.
                """.formatted(goalTitle, category, description == null ? "" : description);

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "temperature", 0.7
        );

        JsonNode response = restClient.post()
                .uri("/chat/completions")
                .body(body)
                .retrieve()
                .body(JsonNode.class);

        String content = response.get("choices").get(0).get("message").get("content").asText();
        content = content.replace("```json", "").replace("```", "").trim();

        try {
            return objectMapper.readValue(content, new TypeReference<>() {});
        } catch (Exception e) {
            throw new IllegalStateException("AI nije vratio valjan JSON: " + content);
        }
    }

    public byte[] generateImage(String userPrompt) {
        Map<String, Object> body = Map.of(
                "model", "dall-e-3",
                "prompt", "Inspirativna, estetski lijepa fotografija za vision board osobnih ciljeva: " + userPrompt,
                "n", 1,
                "size", "1024x1024",
                "response_format", "b64_json"
        );

        JsonNode response = restClient.post()
                .uri("/images/generations")
                .body(body)
                .retrieve()
                .body(JsonNode.class);

        String b64 = response.get("data").get(0).get("b64_json").asText();
        return Base64.getDecoder().decode(b64);
    }
}