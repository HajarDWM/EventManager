package com.example.eventmanager.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventTaskDTO {
    private Long id;
    private Long eventId;
    private String title;
    private String description;
    private LocalDate dueDate;
    private String priority;
    private String status;
    private String assignedTo;
}
