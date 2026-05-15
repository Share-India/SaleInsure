package com.salesapp.backend.controllers;

import com.salesapp.backend.config.JwtUtils;
import com.salesapp.backend.models.Role;
import com.salesapp.backend.models.User;
import com.salesapp.backend.payload.request.LoginRequest;
import com.salesapp.backend.payload.request.SignupRequest;
import com.salesapp.backend.payload.response.JwtResponse;
import com.salesapp.backend.payload.response.MessageResponse;
import com.salesapp.backend.repository.UserRepository;
import com.salesapp.backend.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.Map;
import com.salesapp.backend.models.Message;
import com.salesapp.backend.repository.MessageRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    MessageRepository messageRepository;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is required!"));
        }

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        List<User> managers = userRepository.findByRole(Role.MANAGER);
        if (managers.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: No manager found to reset password!"));
        }

        for (User manager : managers) {
            Message message = new Message(user.getId(), manager.getId(), "Password reset requested for user: " + username, LocalDateTime.now());
            messageRepository.save(message);
        }

        return ResponseEntity.ok(new MessageResponse("Password reset request sent to manager."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getProfilePhotoUrl(),
                userDetails.getDesignation(),
                roles));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        Role userRole = Role.SALESPERSON;
        if(signUpRequest.getRole() != null && signUpRequest.getRole().equalsIgnoreCase("manager")) {
            userRole = Role.MANAGER;
        }

        User user = new User(signUpRequest.getUsername(),
                encoder.encode(signUpRequest.getPassword()),
                userRole);
        user.setDesignation(signUpRequest.getDesignation());

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
