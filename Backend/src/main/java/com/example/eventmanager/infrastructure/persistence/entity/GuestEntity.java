package com.example.eventmanager.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "guests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GuestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String email;
    private String phone;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "table_number")
    private String tableNumber;

    @Column(name = "dietary_requirements")
    private String dietaryRequirements;

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "payment_status")
    private String paymentStatus = "NOT_REQUIRED";

    @Column(name = "paid_amount")
    private Double paidAmount = 0.0;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "payment_date")
    private java.time.LocalDateTime paymentDate;
}
