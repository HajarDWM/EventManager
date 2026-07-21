package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.EventTaskDTO;
import com.example.eventmanager.domain.model.EventTask;
import com.example.eventmanager.domain.model.TaskPriority;
import com.example.eventmanager.domain.model.TaskStatus;
import com.example.eventmanager.infrastructure.persistence.entity.EventTaskEntity;
import org.springframework.stereotype.Component;

@Component
public class EventTaskMapper {

    public EventTaskDTO toDTO(EventTask domain) {
        if (domain == null) return null;
        return EventTaskDTO.builder()
                .id(domain.getId())
                .eventId(domain.getEventId())
                .title(domain.getTitle())
                .description(domain.getDescription())
                .dueDate(domain.getDueDate())
                .priority(domain.getPriority() != null ? domain.getPriority().name() : TaskPriority.MEDIUM.name())
                .status(domain.getStatus() != null ? domain.getStatus().name() : TaskStatus.TODO.name())
                .assignedTo(domain.getAssignedTo())
                .build();
    }

    public EventTask toDomain(EventTaskDTO dto) {
        if (dto == null) return null;
        TaskPriority priorityEnum = TaskPriority.MEDIUM;
        if (dto.getPriority() != null) {
            try {
                priorityEnum = TaskPriority.valueOf(dto.getPriority().toUpperCase());
            } catch (Exception ignored) {}
        }
        TaskStatus statusEnum = TaskStatus.TODO;
        if (dto.getStatus() != null) {
            try {
                statusEnum = TaskStatus.valueOf(dto.getStatus().toUpperCase());
            } catch (Exception ignored) {}
        }
        return new EventTask(
                dto.getId(),
                dto.getEventId(),
                dto.getTitle(),
                dto.getDescription(),
                dto.getDueDate(),
                priorityEnum,
                statusEnum,
                dto.getAssignedTo()
        );
    }

    public EventTaskEntity toEntity(EventTask domain) {
        if (domain == null) return null;
        return new EventTaskEntity(
                domain.getId(),
                domain.getEventId(),
                domain.getTitle(),
                domain.getDescription(),
                domain.getDueDate(),
                domain.getPriority() != null ? domain.getPriority().name() : TaskPriority.MEDIUM.name(),
                domain.getStatus() != null ? domain.getStatus().name() : TaskStatus.TODO.name(),
                domain.getAssignedTo()
        );
    }

    public EventTask toDomainFromEntity(EventTaskEntity entity) {
        if (entity == null) return null;
        TaskPriority priorityEnum = TaskPriority.MEDIUM;
        if (entity.getPriority() != null) {
            try {
                priorityEnum = TaskPriority.valueOf(entity.getPriority().toUpperCase());
            } catch (Exception ignored) {}
        }
        TaskStatus statusEnum = TaskStatus.TODO;
        if (entity.getStatus() != null) {
            try {
                statusEnum = TaskStatus.valueOf(entity.getStatus().toUpperCase());
            } catch (Exception ignored) {}
        }
        return new EventTask(
                entity.getId(),
                entity.getEventId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getDueDate(),
                priorityEnum,
                statusEnum,
                entity.getAssignedTo()
        );
    }
}
