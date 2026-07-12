package hr.algebra.goalplanner.service;

import hr.algebra.goalplanner.dto.ScenarioRequest;
import hr.algebra.goalplanner.model.Scenario;
import hr.algebra.goalplanner.model.User;
import hr.algebra.goalplanner.repository.ScenarioRepository;
import hr.algebra.goalplanner.security.CurrentUserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScenarioServiceTest {

    @Mock
    private ScenarioRepository scenarioRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private ScenarioService scenarioService;

    @Test
    @DisplayName("Kreiranje scenarija s okvirom od 3 mjeseca postavlja ispravan targetDate")
    void create_threeMonths_calculatesTargetDate() {
        // Given
        User user = new User();
        user.setId(1L);
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(scenarioRepository.save(any(Scenario.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        LocalDate start = LocalDate.of(2026, 7, 10);
        ScenarioRequest request = new ScenarioRequest(
                "Test", "Opis", Scenario.TimeFrame.THREE_MONTHS, start);

        // When
        Scenario result = scenarioService.create(request);

        // Then
        assertThat(result.getTargetDate()).isEqualTo(LocalDate.of(2026, 10, 10));
        assertThat(result.getUser()).isEqualTo(user);
    }

    @Test
    @DisplayName("Kreiranje scenarija s okvirom od 1 godine postavlja ispravan targetDate")
    void create_oneYear_calculatesTargetDate() {
        // Given
        User user = new User();
        user.setId(1L);
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(scenarioRepository.save(any(Scenario.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        LocalDate start = LocalDate.of(2026, 7, 10);
        ScenarioRequest request = new ScenarioRequest(
                "Test", "Opis", Scenario.TimeFrame.ONE_YEAR, start);

        // When
        Scenario result = scenarioService.create(request);

        // Then
        assertThat(result.getTargetDate()).isEqualTo(LocalDate.of(2027, 7, 10));
    }

    @Test
    @DisplayName("Dohvat tuđeg scenarija baca iznimku (provjera vlasništva)")
    void getById_notOwner_throwsException() {
        // Given
        User owner = new User();
        owner.setId(1L);
        User intruder = new User();
        intruder.setId(2L);

        Scenario scenario = new Scenario();
        scenario.setId(5L);
        scenario.setUser(owner);

        when(scenarioRepository.findById(5L)).thenReturn(Optional.of(scenario));
        when(currentUserService.getCurrentUser()).thenReturn(intruder);

        // When / Then
        assertThatThrownBy(() -> scenarioService.getById(5L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Access denied");
    }
}