package com.jobportal.config;

import com.jobportal.entity.AppUser;
import com.jobportal.entity.Role;
import com.jobportal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner createAdmin(UserRepository userRepository,
                                  PasswordEncoder passwordEncoder) {

        return args -> {

            String adminEmail = "admin@careerconnect.com";

            if (!userRepository.existsByEmail(adminEmail)) {

                AppUser admin = new AppUser();

                admin.setFullName("System Administrator");
                admin.setEmail(adminEmail);

                // Development password only.
                // Change this before deployment.
                admin.setPassword(
                        passwordEncoder.encode("Admin@12345")
                );

                admin.setRole(Role.ADMIN);

                userRepository.save(admin);

                System.out.println(
                        "=============================================="
                );
                System.out.println(
                        "ADMIN ACCOUNT CREATED"
                );
                System.out.println(
                        "Email: " + adminEmail
                );
                System.out.println(
                        "Password: Admin@12345"
                );
                System.out.println(
                        "=============================================="
                );
            }
        };
    }
}