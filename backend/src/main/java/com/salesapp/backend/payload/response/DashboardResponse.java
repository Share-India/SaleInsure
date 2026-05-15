package com.salesapp.backend.payload.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {
    private long talksToday;
    private long connectionsMade;
    private long dealsClosed;
    private double totalPremium;
    
    private RevenueProgressDto revenueProgress;
    private PipelineHealthDto pipelineHealth;
    private List<TopPerformerDto> topPerformers;
    private List<ActivityDto> recentActivities;
    private List<ActivityDto> allDeals;
    
    private long connectionsToday;
    private long closuresToday;
    
    private int teamConnectionTarget;
    private int teamConversationTarget;
    private int teamClosureTarget;
    
    private int totalTeamMembers;
    private List<String> activeMemberPhotos;
}
