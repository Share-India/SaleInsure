package com.salesapp.backend.controllers;

import com.salesapp.backend.models.Role;
import com.salesapp.backend.models.User;
import com.salesapp.backend.payload.response.MessageResponse;
import com.salesapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    private static String UPLOAD_DIR = "uploads/profiles/";

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> createUser(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            @RequestParam("role") String roleStr,
            @RequestParam(value = "designation", required = false) String designation,
            @RequestParam(value = "monthlyTarget", required = false) Double monthlyTarget,
            @RequestParam(value = "dailyConnectionTarget", defaultValue = "10") Integer dailyConnectionTarget,
            @RequestParam(value = "dailyConversationTarget", defaultValue = "5") Integer dailyConversationTarget,
            @RequestParam(value = "dailyClosureTarget", defaultValue = "1") Integer dailyClosureTarget,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        Role userRole = Role.SALESPERSON;
        if(roleStr != null && roleStr.equalsIgnoreCase("manager")) {
            userRole = Role.MANAGER;
        }

        User user = new User(username, encoder.encode(password), userRole);
        user.setMonthlyTarget(monthlyTarget);
        user.setDailyConnectionTarget(dailyConnectionTarget);
        user.setDailyConversationTarget(dailyConversationTarget);
        user.setDailyClosureTarget(dailyClosureTarget);

        if (designation != null && !designation.trim().isEmpty()) {
            user.setDesignation(designation);
        }

        if (file != null && !file.isEmpty()) {
            try {
                // Ensure directory exists
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // Generate unique filename
                String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(filename);
                Files.copy(file.getInputStream(), filePath);

                // Set URL path for frontend to access (using the WebConfig mapping /uploads/**)
                user.setProfilePhotoUrl("/uploads/profiles/" + filename);

            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(new MessageResponse("Error saving profile photo"));
            }
        }

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
    @PutMapping("/{id}/password")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestParam("password") String newPassword) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found."));
        }
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Password updated successfully!"));
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
