package com.salesapp.backend.repository;

import com.salesapp.backend.models.Activity;
import com.salesapp.backend.models.ActivityStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByUserId(Long userId);
    List<Activity> findByActivityDate(LocalDate date);
    long countByStageAndActivityDate(ActivityStage stage, LocalDate date);
    long countByStage(ActivityStage stage);
    
    long countByStageAndUserId(ActivityStage stage, Long userId);
    long countByStageAndUserIdAndActivityDate(ActivityStage stage, Long userId, LocalDate date);
    
    List<Activity> findTop5ByOrderByActivityDateDescIdDesc();
    List<Activity> findTop5ByUserIdOrderByActivityDateDescIdDesc(Long userId);
    List<Activity> findTop50ByUserIdOrderByActivityDateDescIdDesc(Long userId);
    

    List<Activity> findTop50ByOrderByActivityDateDescIdDesc();
    
    List<Activity> findByStageAndActivityDateBetween(ActivityStage stage, LocalDate startDate, LocalDate endDate);
    long countByStageAndUserIdAndActivityDateBetween(ActivityStage stage, Long userId, LocalDate startDate, LocalDate endDate);
    
    List<Activity> findByClientNameOrderByActivityDateAscIdAsc(String clientName);
}
