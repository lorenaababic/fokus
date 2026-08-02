package hr.algebra.goalplanner.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "behaviors")
@Getter
@Setter
public class Behavior {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;

    @OneToMany(mappedBy = "behavior", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ActivityLog> logs = new ArrayList<>();

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequency frequency;

    @Column(nullable = false)
    private Integer targetCount;

    public enum Frequency {
        DAILY, WEEKLY
    }
}