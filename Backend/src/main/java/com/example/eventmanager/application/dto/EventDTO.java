package com.example.eventmanager.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    private Long id;
    private String title;
    private LocalDateTime eventDate;
    private String location;
    private Integer guestCount;
    private String status;
    private Long catererId;
    private LocalDateTime createdAt;
}
