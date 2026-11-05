package com.jobportal.service;

import com.jobportal.entity.AppUser;
import com.jobportal.entity.Role;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public AdminService(UserRepository userRepository,
                        JobRepository jobRepository) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }

    public Map<String, Long> getStatistics() {

        Map<String, Long> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.count());
        stats.put(
                "totalSeekers",
                userRepository.countByRole(Role.JOB_SEEKER)
        );
        stats.put(
                "totalRecruiters",
                userRepository.countByRole(Role.RECRUITER)
        );
        stats.put(
                "totalJobs",
                jobRepository.countByActiveTrue()
        );

        return stats;
    }
}