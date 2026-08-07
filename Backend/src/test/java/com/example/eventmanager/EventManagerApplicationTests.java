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
        try {
            System.out.println("====== EXCEL POI TEST ======");
            try (org.apache.poi.xssf.usermodel.XSSFWorkbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
                org.apache.poi.xssf.usermodel.XSSFSheet sheet = workbook.createSheet("Invités");
                org.apache.poi.xssf.usermodel.XSSFRow headerRow = sheet.createRow(0);
                headerRow.createCell(0).setCellValue("Nom Complet");
                headerRow.createCell(1).setCellValue("Téléphone");
                headerRow.createCell(2).setCellValue("Email");
                headerRow.createCell(3).setCellValue("Groupe");

                String[] groups = {
                    "Famille Proche", "Famille Élargie", "Amis & Proches", "Hommes", "Femmes",
                    "VIP", "Enfants", "Direction / Management", "Partenaires / Clients VIP",
                    "Équipe Interne / Salariés", "Presse / Médias", "Invités Externes",
                    "VIP / Sponsors", "Table d'Honneur", "Grand Public / Standard",
                    "Presse & Officiels", "Staff / Organisateurs"
                };

                org.apache.poi.xssf.usermodel.XSSFSheet groupsSheet = workbook.createSheet("PredefinedGroups");
                for (int i = 0; i < groups.length; i++) {
                    org.apache.poi.xssf.usermodel.XSSFRow row = groupsSheet.createRow(i);
                    row.createCell(0).setCellValue(groups[i]);
                }
                workbook.setSheetHidden(workbook.getSheetIndex("PredefinedGroups"), true);

                org.apache.poi.ss.usermodel.DataValidationHelper validationHelper = sheet.getDataValidationHelper();
                org.apache.poi.ss.usermodel.DataValidationConstraint constraint = validationHelper.createFormulaListConstraint("PredefinedGroups!$A$1:$A$" + groups.length);
                org.apache.poi.ss.util.CellRangeAddressList addressList = new org.apache.poi.ss.util.CellRangeAddressList(1, 999, 3, 3);
                org.apache.poi.ss.usermodel.DataValidation validation = validationHelper.createValidation(constraint, addressList);
                validation.setErrorStyle(org.apache.poi.ss.usermodel.DataValidation.ErrorStyle.WARNING);
                validation.setShowErrorBox(true);
                validation.createErrorBox("Groupe Inhabituel", "Le groupe saisi n'est pas dans la liste prédéfinie. Vous pouvez continuer ou sélectionner un groupe de la liste.");
                sheet.addValidationData(validation);
                
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
                workbook.write(out);
                System.out.println("====== EXCEL POI TEST SUCCESS, bytes=" + out.size() + " ======");
            }
        } catch (Exception e) {
            System.err.println("====== EXCEL POI TEST EXCEPTION ======");
            e.printStackTrace();
        }
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
