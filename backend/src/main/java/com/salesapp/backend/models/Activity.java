package com.salesapp.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityStage stage;

    @Column(nullable = false)
    private LocalDate activityDate;

    @Column(nullable = false)
    private String timeSlot;

    // Conversation Stage fields
    private String clientName;
    private String contactNumber;
    private String productPitched;
    private String productTerm;
    private Double salaryPercentage;
    @Column(columnDefinition = "TEXT")
    private String meetingsData; // Stores JSON array of meetings
    private String remarks;

    // Connection Stage fields
    private String modeOfConnection;
    @Column(columnDefinition = "TEXT")
    private String personalDetails;
    @Column(columnDefinition = "TEXT")
    private String familyDetails;
    private String personalInterests;
    private String needsIdentifiedList; // Checkbox JSON/CSV
    private String needIdentified;
    private String requirementDetails;
    private LocalDate expectedClosureDate;
    private LocalDate followUpDate;

    // Closure Stage fields
    private String productName;
    private Double premiumAmount;
    private LocalDate closureDate;
    private String status; // WON, LOST
}
