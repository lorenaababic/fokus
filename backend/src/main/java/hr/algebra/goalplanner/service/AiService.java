package hr.algebra.goalplanner.service;

import hr.algebra.goalplanner.dto.AiSuggestionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

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

    @SuppressWarnings("unchecked")
    public List<AiSuggestionResponse> suggestBehaviors(String goalTitle,
                                                       String description,
                                                       String category) {
        String prompt = """
                Korisnik ima osobni cilj: "%s" (kategorija: %s). Opis: "%s".
                Predloži 3 do 5 konkretnih, mjerljivih ponašanja koja vode ostvarenju tog cilja.

                Pravila za polja:
                - "frequency" je "DAILY" samo ako se ponašanje radi svaki dan, inače "WEEKLY".
                - Za "DAILY" polje "targetCount" znači koliko puta DNEVNO i gotovo uvijek iznosi 1.
                - Za "WEEKLY" polje "targetCount" znači koliko puta TJEDNO i mora biti broj od 1 do 7.
                - Ponašanja moraju biti realna i održiva; ne predlaži pretjerane brojeve ponavljanja.

                Odgovori ISKLJUČIVO čistim JSON nizom, bez markdowna, u formatu:
                [{"title":"...","frequency":"DAILY ili WEEKLY","targetCount":broj}]
                Naslovi ponašanja neka budu kratki i na hrvatskom jeziku.
                """.formatted(goalTitle, category, description == null ? "" : description);

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "temperature", 0.7
        );

        Map<String, Object> response = restClient.post()
                .uri("/chat/completions")
                .body(body)
                .retrieve()
                .body(Map.class);

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        String content = ((String) message.get("content"))
                .replace("```json", "").replace("```", "").trim();

        try {
            return objectMapper.readValue(content, new TypeReference<List<AiSuggestionResponse>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("AI nije vratio valjan JSON: " + content);
        }
    }

    @SuppressWarnings("unchecked")
    public byte[] generateImage(String userPrompt) {
        Map<String, Object> body = Map.of(
                "model", "gpt-image-1-mini",
                "prompt", "Inspirativna, estetski lijepa fotografija za vision board osobnih ciljeva: "
                        + userPrompt,
                "n", 1,
                "size", "1024x1024"
        );

        Map<String, Object> response = restClient.post()
                .uri("/images/generations")
                .body(body)
                .retrieve()
                .body(Map.class);

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        String b64 = (String) data.get(0).get("b64_json");
        return Base64.getDecoder().decode(b64);
    }
}