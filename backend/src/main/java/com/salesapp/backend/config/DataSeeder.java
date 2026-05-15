package com.salesapp.backend.config;

import com.salesapp.backend.models.Role;
import com.salesapp.backend.models.User;
import com.salesapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("ShareIndia")) {
            User manager = new User();
            manager.setUsername("ShareIndia");
            manager.setPassword(passwordEncoder.encode("ShareIndia@123"));
            manager.setRole(Role.MANAGER);
            userRepository.save(manager);
            System.out.println("Default Manager created: ShareIndia / ShareIndia@123");
        } else {
            User manager = userRepository.findByUsername("ShareIndia").get();
            manager.setPassword(passwordEncoder.encode("ShareIndia@123"));
            userRepository.save(manager);
        }
    }
}
