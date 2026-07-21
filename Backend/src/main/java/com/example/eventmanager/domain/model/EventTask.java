package com.example.eventmanager.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventTask {
    private Long id;
    private Long eventId;
    private String title;
    private String description;
    private LocalDate dueDate;
    private TaskPriority priority;
    private TaskStatus status;
    private String assignedTo;

    public void updateDetails(String title, String description, LocalDate dueDate, TaskPriority priority, TaskStatus status, String assignedTo) {
        if (title != null && !title.trim().isEmpty()) {
            this.title = title.trim();
        }
        this.description = description;
        this.dueDate = dueDate;
        if (priority != null) {
            this.priority = priority;
        }
        if (status != null) {
            this.status = status;
        }
        this.assignedTo = assignedTo;
    }

    public void toggleStatus() {
        if (this.status == TaskStatus.COMPLETED) {
            this.status = TaskStatus.TODO;
        } else {
            this.status = TaskStatus.COMPLETED;
        }
    }
}
