package com.example.eventmanager;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("dev")
class EventManagerApplicationTests {

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.eventmanager.infrastructure.persistence.repository.JpaMenuItemRepository jpaMenuItemRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.eventmanager.presentation.resource.MenuItemResource menuItemResource;

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.eventmanager.application.mapper.MenuItemMapper menuItemMapper;

    @Test
    void contextLoads() {
    }

    @Test
    void testQuery() {
        try {
            System.out.println("====== STARTING QUERY TEST ======");
            jpaMenuItemRepository.findAllByCatererId(1L);
            System.out.println("====== QUERY TEST SUCCESS ======");
        } catch (Exception e) {
            System.err.println("====== QUERY TEST EXCEPTION ======");
            e.printStackTrace();
        }
    }

    @Test
    void testController() {
        try {
            System.out.println("====== STARTING CONTROLLER TEST ======");
            org.springframework.security.core.context.SecurityContext context = org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();
            java.util.List<org.springframework.security.core.GrantedAuthority> authorities = java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_TRAITEUR"));
            com.example.eventmanager.infrastructure.security.model.CatererUserDetails principal = new com.example.eventmanager.infrastructure.security.model.CatererUserDetails(
                "test@eventmanager.com", "password", authorities, 1L, "TRAITEUR", "ACTIVE"
            );
            org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                principal, null, authorities
            );
            context.setAuthentication(auth);
            org.springframework.security.core.context.SecurityContextHolder.setContext(context);

            menuItemResource.getCatererMenuItems();
            System.out.println("====== CONTROLLER TEST SUCCESS ======");
        } catch (Exception e) {
            System.err.println("====== CONTROLLER TEST EXCEPTION ======");
            e.printStackTrace();
        }
    }

    @Test
    void testRealData() {
        try {
            System.out.println("====== REAL DATA TEST ======");
            java.util.List<com.example.eventmanager.infrastructure.persistence.entity.MenuItemEntity> all = jpaMenuItemRepository.findAll();
            System.out.println("Total menu items in DB: " + all.size());
            for (com.example.eventmanager.infrastructure.persistence.entity.MenuItemEntity entity : all) {
                System.out.println("Item: id=" + entity.getId() + ", name=" + entity.getName() + ", eventId=" + entity.getEventId());
                com.example.eventmanager.domain.model.MenuItem domain = menuItemMapper.toDomainFromEntity(entity);
                com.example.eventmanager.application.dto.MenuItemDTO dto = menuItemMapper.toDTO(domain);
                System.out.println("Mapped DTO successfully: " + dto.getName());
            }
            System.out.println("====== REAL DATA TEST SUCCESS ======");
        } catch (Exception e) {
            System.err.println("====== REAL DATA TEST EXCEPTION ======");
            e.printStackTrace();
        }
    }
}
