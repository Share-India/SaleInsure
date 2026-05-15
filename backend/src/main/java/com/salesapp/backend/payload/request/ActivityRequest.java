package com.salesapp.backend.payload.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ActivityRequest {
    private String stage; // CONVERSATION, CONNECTION, CLOSURE
    private LocalDate activityDate;
    private String timeSlot;
    
    // Conversation
    private String clientName;
    private String contactNumber;
    private String productPitched;
    private String productTerm;
    private Double salaryPercentage;
    private String meetingsData;
    private String remarks;
    
    // Connection
    private String modeOfConnection;
    private String personalDetails;
    private String familyDetails;
    private String personalInterests;
    private String needsIdentifiedList;
    private String needIdentified;
    private String requirementDetails;
    private LocalDate expectedClosureDate;
    private LocalDate followUpDate;
    
    // Closure
    private String productName;
    private Double premiumAmount;
    private LocalDate closureDate;
    private String status;
}
