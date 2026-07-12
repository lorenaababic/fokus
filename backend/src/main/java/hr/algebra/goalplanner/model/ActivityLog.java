package hr.algebra.goalplanner.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "activity_logs")
@Getter
@Setter
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "behavior_id", nullable = false)
    private Behavior behavior;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private boolean completed;

    private String note;
}
