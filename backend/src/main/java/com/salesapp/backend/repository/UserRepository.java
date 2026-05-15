package com.salesapp.backend.repository;

import com.salesapp.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    java.util.List<User> findByRole(com.salesapp.backend.models.Role role);

    @org.springframework.data.jpa.repository.Query("SELECT new com.salesapp.backend.payload.response.TopPerformerDto(" +
           "u.id, u.username, SUM(CASE WHEN a.stage = 'CLOSURE' THEN a.premiumAmount ELSE 0.0 END), " +
           "SUM(CASE WHEN a.stage = 'CLOSURE' THEN 1L ELSE 0L END), u.monthlyTarget, u.profilePhotoUrl, u.designation) " +
           "FROM User u LEFT JOIN Activity a ON u.id = a.user.id " +
           "WHERE u.role = 'SALESPERSON' " +
           "GROUP BY u.id, u.username, u.monthlyTarget, u.profilePhotoUrl, u.designation " +
           "ORDER BY SUM(CASE WHEN a.stage = 'CLOSURE' THEN a.premiumAmount ELSE 0.0 END) DESC")
    java.util.List<com.salesapp.backend.payload.response.TopPerformerDto> findTeamPerformance(org.springframework.data.domain.Pageable pageable);
}
