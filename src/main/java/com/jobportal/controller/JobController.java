
package com.jobportal.controller;

import com.jobportal.entity.Job;
import com.jobportal.service.JobService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/recruiter/jobs")
    public ResponseEntity<Job> createJob(
            @Valid @RequestBody Job job,
            Authentication authentication) {

        Job savedJob = jobService.createJob(
                job, authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedJob);
    }

    @GetMapping("/recruiter/jobs")
    public ResponseEntity<List<Job>> getRecruiterJobs(
            Authentication authentication) {

        return ResponseEntity.ok(
                jobService.getRecruiterJobs(authentication.getName()));
    }

    @PutMapping("/recruiter/jobs/{id}")
    public ResponseEntity<Job> updateJob(
            @PathVariable Long id,
            @RequestBody Job job,
            Authentication authentication) {

        return ResponseEntity.ok(
                jobService.updateJob(id, job, authentication.getName()));
    }

    @DeleteMapping("/recruiter/jobs/{id}")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long id,
            Authentication authentication) {

        jobService.deleteJob(id, authentication.getName());

        return ResponseEntity.ok("Job deleted successfully");
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllActiveJobs());
    }

    @GetMapping("/jobs/search/title")
    public ResponseEntity<List<Job>> searchByTitle(
            @RequestParam String title) {

        return ResponseEntity.ok(jobService.searchByTitle(title));
    }

    @GetMapping("/jobs/search/location")
    public ResponseEntity<List<Job>> searchByLocation(
            @RequestParam String location) {

        return ResponseEntity.ok(jobService.searchByLocation(location));
    }
}
