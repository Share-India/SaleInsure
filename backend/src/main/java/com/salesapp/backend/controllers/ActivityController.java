package com.salesapp.backend.controllers;

import com.salesapp.backend.models.Activity;
import com.salesapp.backend.models.ActivityStage;
import com.salesapp.backend.models.User;
import com.salesapp.backend.payload.request.ActivityRequest;
import com.salesapp.backend.payload.response.MessageResponse;
import com.salesapp.backend.repository.ActivityRepository;
import com.salesapp.backend.repository.UserRepository;
import com.salesapp.backend.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    @Autowired
    ActivityRepository activityRepository;

    @Autowired
    UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createActivity(@RequestBody ActivityRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        Activity activity = new Activity();
        activity.setUser(user);
        activity.setStage(ActivityStage.valueOf(request.getStage().toUpperCase()));
        activity.setActivityDate(request.getActivityDate() != null ? request.getActivityDate() : java.time.LocalDate.now());
        activity.setTimeSlot(request.getTimeSlot() != null ? request.getTimeSlot() : "Anytime");
        activity.setClientName(request.getClientName());

        // Map fields based on stage
        if (activity.getStage() == ActivityStage.CONVERSATION) {
            activity.setContactNumber(request.getContactNumber());
            activity.setModeOfConnection(request.getModeOfConnection());
            activity.setProductTerm(request.getProductTerm());
            activity.setSalaryPercentage(request.getSalaryPercentage());
            activity.setMeetingsData(request.getMeetingsData());
            activity.setRemarks(request.getRemarks());
        } else if (activity.getStage() == ActivityStage.CONNECTION) {
            activity.setProductPitched(request.getProductPitched());
            activity.setModeOfConnection(request.getModeOfConnection());
            activity.setPersonalDetails(request.getPersonalDetails());
            activity.setFamilyDetails(request.getFamilyDetails());
            activity.setPersonalInterests(request.getPersonalInterests());
            activity.setNeedsIdentifiedList(request.getNeedsIdentifiedList());
            activity.setNeedIdentified(request.getNeedIdentified());
            activity.setRequirementDetails(request.getRequirementDetails());
            activity.setExpectedClosureDate(request.getExpectedClosureDate());
            activity.setFollowUpDate(request.getFollowUpDate());
            activity.setRemarks(request.getRemarks());
        } else if (activity.getStage() == ActivityStage.CLOSURE) {
            activity.setProductName(request.getProductName());
            activity.setPremiumAmount(request.getPremiumAmount());
            activity.setClosureDate(request.getClosureDate());
            activity.setStatus(request.getStatus());
        }

        activityRepository.save(activity);
        return ResponseEntity.ok(new MessageResponse("Activity logged successfully!"));
    }

    @GetMapping
    public ResponseEntity<List<Activity>> getMyActivities() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Activity> activities = activityRepository.findByUserId(userDetails.getId());
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/client/{clientName}")
    public ResponseEntity<List<Activity>> getActivitiesByClient(@PathVariable String clientName) {
        List<Activity> activities = activityRepository.findByClientNameOrderByActivityDateAscIdAsc(clientName);
        return ResponseEntity.ok(activities);
    }
}
