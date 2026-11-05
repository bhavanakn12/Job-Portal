
package com.jobportal.controller;

import com.jobportal.entity.JobApplication;
import com.jobportal.service.JobService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApplicationController {

    private final JobService jobService;

    public ApplicationController(JobService jobService) {
        this.jobService = jobService;
    }

    // Job seeker applies for a job
    @PostMapping("/seeker/jobs/{jobId}/apply")
    public ResponseEntity<JobApplication> applyForJob(
            @PathVariable Long jobId,
            @RequestParam(required = false, defaultValue = "") String resumePath,
            Authentication authentication) {

        JobApplication application = jobService.applyForJob(
                jobId,
                authentication.getName(),
                resumePath
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(application);
    }

    // Job seeker views their applications
    @GetMapping("/seeker/applications")
    public ResponseEntity<List<JobApplication>> getMyApplications(
            Authentication authentication) {

        return ResponseEntity.ok(
                jobService.getMyApplications(authentication.getName())
        );
    }

    // Recruiter views applicants for their job
    @GetMapping("/recruiter/jobs/{jobId}/applications")
    public ResponseEntity<List<JobApplication>> getJobApplications(
            @PathVariable Long jobId,
            Authentication authentication) {

        return ResponseEntity.ok(
                jobService.getJobApplications(
                        jobId,
                        authentication.getName()
                )
        );
    }

    // Recruiter updates application status
    @PutMapping("/recruiter/applications/{applicationId}/status")
    public ResponseEntity<JobApplication> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam String status,
            Authentication authentication) {

        return ResponseEntity.ok(
                jobService.updateApplicationStatus(
                        applicationId,
                        status,
                        authentication.getName()
                )
        );
    }
}
