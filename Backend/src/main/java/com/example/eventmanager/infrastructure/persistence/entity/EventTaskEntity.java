package com.example.eventmanager.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "event_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventTaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false)
    private String priority = "MEDIUM";

    @Column(nullable = false)
    private String status = "TODO";

    @Column(name = "assigned_to")
    private String assignedTo;
}
