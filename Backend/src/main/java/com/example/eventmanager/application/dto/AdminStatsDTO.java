package com.example.eventmanager.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsDTO {
    private long totalCaterers;
    private long totalEvents;
    private long totalGuests;
    private Map<String, Long> catererStatusDistribution;
    private Map<String, Long> subscriptionPlanDistribution;
    private Map<String, Long> eventsStatusDistribution;
}
