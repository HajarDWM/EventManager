package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.MenuItemDTO;
import com.example.eventmanager.domain.model.MenuItem;
import com.example.eventmanager.domain.model.MenuItemCategory;
import com.example.eventmanager.infrastructure.persistence.entity.MenuItemEntity;
import org.springframework.stereotype.Component;

@Component
public class MenuItemMapper {

    public MenuItemDTO toDTO(MenuItem domain) {
        if (domain == null) return null;
        return MenuItemDTO.builder()
                .id(domain.getId())
                .eventId(domain.getEventId())
                .name(domain.getName())
                .category(domain.getCategory() != null ? domain.getCategory().name() : MenuItemCategory.STARTER.name())
                .pricePerPerson(domain.getPricePerPerson())
                .dietaryTag(domain.getDietaryTag())
                .description(domain.getDescription())
                .build();
    }

    public MenuItem toDomain(MenuItemDTO dto) {
        if (dto == null) return null;
        MenuItemCategory categoryEnum = MenuItemCategory.STARTER;
        if (dto.getCategory() != null) {
            try {
                categoryEnum = MenuItemCategory.valueOf(dto.getCategory().toUpperCase());
            } catch (Exception ignored) {}
        }
        return new MenuItem(
                dto.getId(),
                dto.getEventId(),
                dto.getName(),
                categoryEnum,
                dto.getPricePerPerson(),
                dto.getDietaryTag(),
                dto.getDescription()
        );
    }

    public MenuItemEntity toEntity(MenuItem domain) {
        if (domain == null) return null;
        return new MenuItemEntity(
                domain.getId(),
                domain.getEventId(),
                domain.getName(),
                domain.getCategory() != null ? domain.getCategory().name() : MenuItemCategory.STARTER.name(),
                domain.getPricePerPerson(),
                domain.getDietaryTag(),
                domain.getDescription()
        );
    }

    public MenuItem toDomainFromEntity(MenuItemEntity entity) {
        if (entity == null) return null;
        MenuItemCategory categoryEnum = MenuItemCategory.STARTER;
        if (entity.getCategory() != null) {
            try {
                categoryEnum = MenuItemCategory.valueOf(entity.getCategory().toUpperCase());
            } catch (Exception ignored) {}
        }
        return new MenuItem(
                entity.getId(),
                entity.getEventId(),
                entity.getName(),
                categoryEnum,
                entity.getPricePerPerson(),
                entity.getDietaryTag(),
                entity.getDescription()
        );
    }
}
