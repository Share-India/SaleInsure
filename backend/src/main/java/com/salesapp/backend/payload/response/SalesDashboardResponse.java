package com.salesapp.backend.payload.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalesDashboardResponse {
    private long talksToday;
    private long connectionsMade;
    private long dealsClosed;
    private double totalRevenue;
    
    private double targetRevenue;
    private double achievedRevenue;
    
    private PipelineHealthDto pipelineHealth;
    private List<ActivityDto> recentActivities;
    private List<ActivityDto> allDeals;
    
    private Integer dailyConnectionTarget;
    private Integer dailyConversationTarget;
    private Integer dailyClosureTarget;
    
    private long monthlyConnections;
    private long monthlyConversations;
    private long monthlyClosures;
    
    private long connectionsToday;
    private long closuresToday;
}
