package com.salesapp.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "monthly_target")
    private Double monthlyTarget;

    @Column(name = "daily_connection_target")
    private Integer dailyConnectionTarget;

    @Column(name = "daily_conversation_target")
    private Integer dailyConversationTarget;

    @Column(name = "daily_closure_target")
    private Integer dailyClosureTarget;

    @Column(name = "designation")
    private String designation;

    public User(String username, String password, Role role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }
}
