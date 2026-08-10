package com.example.eventmanager.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {
    private Long id;
    private Long eventId;
    private String name;
    private MenuItemCategory category;
    private BigDecimal pricePerPerson;
    private String dietaryTag;
    private String description;
    private String imageUrl;

    public void updateDetails(String name, MenuItemCategory category, BigDecimal pricePerPerson, String dietaryTag, String description, String imageUrl) {
        if (name != null && !name.trim().isEmpty()) {
            this.name = name.trim();
        }
        if (category != null) {
            this.category = category;
        }
        if (pricePerPerson != null) {
            this.pricePerPerson = pricePerPerson;
        }
        this.dietaryTag = dietaryTag;
        this.description = description;
        this.imageUrl = imageUrl;
    }
}
