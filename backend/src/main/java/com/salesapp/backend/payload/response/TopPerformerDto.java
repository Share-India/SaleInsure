package com.salesapp.backend.payload.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TopPerformerDto {
    private Long userId;
    private String username;
    private Double totalPremium;
    private Long dealsClosed;
    private Double quota;
    private String title;
    private String profilePhotoUrl;
    private Long monthlyConnections;
    private Long monthlyConversations;
    private Long monthlyClosures;
    
    private Long dailyConnections;
    private Long dailyConversations;
    private Long dailyClosures;
    
    private Integer dailyConnectionTarget;
    private Integer dailyConversationTarget;
    private Integer dailyClosureTarget;

    public TopPerformerDto(Long userId, String username, Double totalPremium, Long dealsClosed, Double quota, String profilePhotoUrl, String designation) {
        this.userId = userId;
        this.username = username;
        this.totalPremium = totalPremium != null ? totalPremium : 0.0;
        this.dealsClosed = dealsClosed != null ? dealsClosed : 0L;
        this.quota = quota != null ? quota : 150000.0; // Default if not assigned
        this.title = designation != null ? designation : "Sales Executive";
        this.profilePhotoUrl = profilePhotoUrl;
        this.monthlyConnections = 0L;
        this.monthlyConversations = 0L;
        this.monthlyClosures = 0L;
    }
}
