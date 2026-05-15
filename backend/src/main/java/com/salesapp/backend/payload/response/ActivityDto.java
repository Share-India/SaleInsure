package com.salesapp.backend.payload.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActivityDto {
    private Long id;
    private String username;
    private String stage;
    private LocalDate activityDate;
    private String clientName;
    private String productName;
    private Double premiumAmount;
    private String status;
    private String timeAgo; // e.g. "2 mins ago"
    private String profilePhotoUrl;
}
