package com.salesapp.backend.controllers;

import com.salesapp.backend.models.Activity;
import com.salesapp.backend.models.ActivityStage;
import com.salesapp.backend.payload.response.*;
import com.salesapp.backend.repository.ActivityRepository;
import com.salesapp.backend.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    ActivityRepository activityRepository;

    @Autowired
    com.salesapp.backend.repository.UserRepository userRepository;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<DashboardResponse> getDashboardMetrics() {
        LocalDate today = LocalDate.now();
        long talksToday = activityRepository.countByStageAndActivityDate(ActivityStage.CONVERSATION, today);
        long connectionsToday = activityRepository.countByStageAndActivityDate(ActivityStage.CONNECTION, today);
        long closuresToday = activityRepository.countByStageAndActivityDate(ActivityStage.CLOSURE, today);
        
        long connectionsMade = activityRepository.countByStage(ActivityStage.CONNECTION);
        long dealsClosed = activityRepository.countByStage(ActivityStage.CLOSURE);
        
        List<Activity> allActivities = activityRepository.findAll();
        double totalPremium = allActivities.stream()
                .filter(a -> a.getStage() == ActivityStage.CLOSURE && a.getPremiumAmount() != null)
                .mapToDouble(Activity::getPremiumAmount)
                .sum();

        // Pipeline Health
        long leads = activityRepository.countByStage(ActivityStage.CONVERSATION);
        PipelineHealthDto pipelineHealth = new PipelineHealthDto(leads, connectionsMade, connectionsMade / 2, dealsClosed);

        // Top Performers (get top 10 for the team performance view)
        List<TopPerformerDto> topPerformers = userRepository.findTeamPerformance(PageRequest.of(0, 10));
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        for (TopPerformerDto tp : topPerformers) {
            tp.setMonthlyConnections(activityRepository.countByStageAndUserIdAndActivityDateBetween(ActivityStage.CONNECTION, tp.getUserId(), firstDayOfMonth, today));
            tp.setMonthlyConversations(activityRepository.countByStageAndUserIdAndActivityDateBetween(ActivityStage.CONVERSATION, tp.getUserId(), firstDayOfMonth, today));
            tp.setMonthlyClosures(activityRepository.countByStageAndUserIdAndActivityDateBetween(ActivityStage.CLOSURE, tp.getUserId(), firstDayOfMonth, today));
            
            // Daily metrics for modal
            tp.setDailyConnections(activityRepository.countByStageAndUserIdAndActivityDate(ActivityStage.CONNECTION, tp.getUserId(), today));
            tp.setDailyConversations(activityRepository.countByStageAndUserIdAndActivityDate(ActivityStage.CONVERSATION, tp.getUserId(), today));
            tp.setDailyClosures(activityRepository.countByStageAndUserIdAndActivityDate(ActivityStage.CLOSURE, tp.getUserId(), today));
            
            com.salesapp.backend.models.User u = userRepository.findById(tp.getUserId()).orElse(null);
            if (u != null) {
                tp.setDailyConnectionTarget(u.getDailyConnectionTarget() != null ? u.getDailyConnectionTarget() : 10);
                tp.setDailyConversationTarget(u.getDailyConversationTarget() != null ? u.getDailyConversationTarget() : 5);
                tp.setDailyClosureTarget(u.getDailyClosureTarget() != null ? u.getDailyClosureTarget() : 1);
            }
        }

        // Recent Activities (for activity feed, get top 50)
        List<Activity> recentEntityList = activityRepository.findTop50ByOrderByActivityDateDescIdDesc();
        List<ActivityDto> recentActivities = recentEntityList.stream().map(this::mapToDto).collect(Collectors.toList());

        // All Deals (for pipeline)
        List<ActivityDto> allDeals = allActivities.stream().map(this::mapToDto).collect(Collectors.toList());

        // Revenue Progress (Last 7 days)
        LocalDate weekStart = today.minusDays(6);
        List<Activity> weeklyClosures = activityRepository.findByStageAndActivityDateBetween(ActivityStage.CLOSURE, weekStart, today);
        List<Double> weeklyData = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = weekStart.plusDays(i);
            double dailyTotal = weeklyClosures.stream()
                    .filter(a -> a.getActivityDate().equals(d) && a.getPremiumAmount() != null)
                    .mapToDouble(Activity::getPremiumAmount).sum();
            weeklyData.add(dailyTotal);
        }
        RevenueProgressDto revenueProgress = new RevenueProgressDto(500000.0, totalPremium, Math.max(0, 500000.0 - totalPremium), weeklyData);

        // Team Targets and Live Status
        List<com.salesapp.backend.models.User> allUsers = userRepository.findAll();
        List<com.salesapp.backend.models.User> salesPersons = allUsers.stream().filter(u -> u.getRole() == com.salesapp.backend.models.Role.SALESPERSON).collect(Collectors.toList());
        int teamConnectionTarget = salesPersons.stream().mapToInt(u -> u.getDailyConnectionTarget() != null ? u.getDailyConnectionTarget() : 10).sum();
        int teamConversationTarget = salesPersons.stream().mapToInt(u -> u.getDailyConversationTarget() != null ? u.getDailyConversationTarget() : 5).sum();
        int teamClosureTarget = salesPersons.stream().mapToInt(u -> u.getDailyClosureTarget() != null ? u.getDailyClosureTarget() : 1).sum();
        
        int totalTeamMembers = salesPersons.size();
        List<String> activeMemberPhotos = salesPersons.stream()
                .map(com.salesapp.backend.models.User::getProfilePhotoUrl)
                .filter(url -> url != null && !url.isEmpty())
                .limit(5)
                .collect(Collectors.toList());

        DashboardResponse response = new DashboardResponse(talksToday, connectionsMade, dealsClosed, totalPremium, revenueProgress, pipelineHealth, topPerformers, recentActivities, allDeals, connectionsToday, closuresToday, teamConnectionTarget, teamConversationTarget, teamClosureTarget, totalTeamMembers, activeMemberPhotos);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sales-dashboard")
    @PreAuthorize("hasRole('SALESPERSON')")
    public ResponseEntity<SalesDashboardResponse> getSalesDashboardMetrics() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = userDetails.getId();
        LocalDate today = LocalDate.now();

        long talksToday = activityRepository.countByStageAndUserIdAndActivityDate(ActivityStage.CONVERSATION, userId, today);
        long connectionsToday = activityRepository.countByStageAndUserIdAndActivityDate(ActivityStage.CONNECTION, userId, today);
        long closuresToday = activityRepository.countByStageAndUserIdAndActivityDate(ActivityStage.CLOSURE, userId, today);
        
        long connectionsMade = activityRepository.countByStageAndUserId(ActivityStage.CONNECTION, userId);
        long dealsClosed = activityRepository.countByStageAndUserId(ActivityStage.CLOSURE, userId);
        
        List<Activity> myActivities = activityRepository.findByUserId(userId);
        double totalRevenue = myActivities.stream()
                .filter(a -> a.getStage() == ActivityStage.CLOSURE && a.getPremiumAmount() != null)
                .mapToDouble(Activity::getPremiumAmount)
                .sum();

        // Pipeline
        long pipelineConnections = activityRepository.countByStageAndUserId(ActivityStage.CONNECTION, userId);
        long pipelineConversations = activityRepository.countByStageAndUserId(ActivityStage.CONVERSATION, userId);
        long pipelineClosures = activityRepository.countByStageAndUserId(ActivityStage.CLOSURE, userId);
        PipelineHealthDto pipelineHealth = new PipelineHealthDto(pipelineConnections, pipelineConversations, pipelineConversations / 2, pipelineClosures);
        
        // All Deals
        List<ActivityDto> allDeals = myActivities.stream().map(this::mapToDto).collect(Collectors.toList());

        // Recent Activities
        List<Activity> recentEntityList = activityRepository.findTop50ByUserIdOrderByActivityDateDescIdDesc(userId);
        List<ActivityDto> recentActivities = recentEntityList.stream().map(this::mapToDto).collect(Collectors.toList());

        // Targets and Monthly counts
        com.salesapp.backend.models.User user = userRepository.findById(userId).orElse(null);
        Double targetRevenue = user != null && user.getMonthlyTarget() != null ? user.getMonthlyTarget() : 160000.0;
        Integer dailyConnectionTarget = user != null && user.getDailyConnectionTarget() != null ? user.getDailyConnectionTarget() : 10;
        Integer dailyConversationTarget = user != null && user.getDailyConversationTarget() != null ? user.getDailyConversationTarget() : 5;
        Integer dailyClosureTarget = user != null && user.getDailyClosureTarget() != null ? user.getDailyClosureTarget() : 1;
        
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        long monthlyConnections = activityRepository.countByStageAndUserIdAndActivityDateBetween(ActivityStage.CONNECTION, userId, firstDayOfMonth, today);
        long monthlyConversations = activityRepository.countByStageAndUserIdAndActivityDateBetween(ActivityStage.CONVERSATION, userId, firstDayOfMonth, today);
        long monthlyClosures = activityRepository.countByStageAndUserIdAndActivityDateBetween(ActivityStage.CLOSURE, userId, firstDayOfMonth, today);

        SalesDashboardResponse response = new SalesDashboardResponse(
                talksToday, connectionsMade, dealsClosed, totalRevenue, 
                targetRevenue, totalRevenue, pipelineHealth, recentActivities, allDeals,
                dailyConnectionTarget, dailyConversationTarget, dailyClosureTarget,
                monthlyConnections, monthlyConversations, monthlyClosures,
                connectionsToday, closuresToday);
        return ResponseEntity.ok(response);
    }

    private ActivityDto mapToDto(Activity activity) {
        String timeAgo = calculateTimeAgo(activity.getActivityDate());
        String name = "Unknown";
        String photoUrl = null;
        if (activity.getUser() != null) {
            name = activity.getUser().getUsername();
            photoUrl = activity.getUser().getProfilePhotoUrl();
        }
        
        String detailText = activity.getProductName();
        if (activity.getStage() == ActivityStage.CONNECTION) {
            String modeStr = activity.getModeOfConnection() != null ? "Mode: " + activity.getModeOfConnection() : "";
            String pitchStr = activity.getProductPitched() != null ? "Pitched: " + activity.getProductPitched() : "";
            if (!modeStr.isEmpty() && !pitchStr.isEmpty()) detailText = pitchStr + " | " + modeStr;
            else if (!modeStr.isEmpty()) detailText = modeStr;
            else if (!pitchStr.isEmpty()) detailText = pitchStr;
            else detailText = "Initial Connection";
        } else if (activity.getStage() == ActivityStage.CONVERSATION) {
            detailText = activity.getModeOfConnection() != null ? "Mode: " + activity.getModeOfConnection() : "Meeting in progress";
        }

        return new ActivityDto(
            activity.getId(),
            name,
            activity.getStage().name(),
            activity.getActivityDate(),
            activity.getClientName(),
            detailText,
            activity.getPremiumAmount(),
            activity.getStatus(),
            timeAgo,
            photoUrl
        );
    }

    private String calculateTimeAgo(LocalDate date) {
        if (date == null) return "Unknown";
        LocalDate today = LocalDate.now();
        long days = ChronoUnit.DAYS.between(date, today);
        if (days == 0) return "Today";
        if (days == 1) return "Yesterday";
        return days + " days ago";
    }
}
