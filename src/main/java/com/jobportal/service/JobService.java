
package com.jobportal.service;

import com.jobportal.entity.AppUser;
import com.jobportal.entity.Job;
import com.jobportal.entity.Role;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.ApplicationStatus;

import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.repository.JobApplicationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository applicationRepository;

    public JobService(
            JobRepository jobRepository,
            UserRepository userRepository,
            JobApplicationRepository applicationRepository) {

        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
    }

    // Recruiter posts a job
    public Job createJob(Job job, String recruiterEmail) {

        AppUser recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        if (recruiter.getRole() != Role.RECRUITER) {
            throw new RuntimeException("Only recruiters can post jobs");
        }

        job.setRecruiter(recruiter);
        job.setActive(true);

        return jobRepository.save(job);
    }

    // Get recruiter's jobs
    public List<Job> getRecruiterJobs(String recruiterEmail) {

        AppUser recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        return jobRepository.findByRecruiterId(recruiter.getId());
    }

    // Get all active jobs
    public List<Job> getAllActiveJobs() {
        return jobRepository.findByActiveTrue();
    }

    // Update job
    @Transactional
    public Job updateJob(Long jobId, Job updatedJob, String recruiterEmail) {

        Job existingJob = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!existingJob.getRecruiter().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("You cannot update another recruiter's job");
        }

        existingJob.setTitle(updatedJob.getTitle());
        existingJob.setCompanyName(updatedJob.getCompanyName());
        existingJob.setLocation(updatedJob.getLocation());
        existingJob.setDescription(updatedJob.getDescription());
        existingJob.setEmploymentType(updatedJob.getEmploymentType());
        existingJob.setSalaryRange(updatedJob.getSalaryRange());
        existingJob.setRequiredSkills(updatedJob.getRequiredSkills());

        return existingJob;
    }

    // Soft delete job
    @Transactional
    public void deleteJob(Long jobId, String recruiterEmail) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getRecruiter().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("You cannot delete another recruiter's job");
        }

        job.setActive(false);
    }

    // Search jobs by title
    public List<Job> searchByTitle(String title) {

        return jobRepository.findByTitleContainingIgnoreCase(title)
                .stream()
                .filter(Job::isActive)
                .toList();
    }

    // Search jobs by location
    public List<Job> searchByLocation(String location) {

        return jobRepository.findByLocationContainingIgnoreCase(location)
                .stream()
                .filter(Job::isActive)
                .toList();
    }

    // Job seeker applies for a job
    @Transactional
    public JobApplication applyForJob(
            Long jobId, String applicantEmail, String resumePath) {

        AppUser applicant = userRepository.findByEmail(applicantEmail)
                .orElseThrow(() -> new RuntimeException("Applicant not found"));

        if (applicant.getRole() != Role.JOB_SEEKER) {
            throw new RuntimeException("Only job seekers can apply");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.isActive()) {
            throw new RuntimeException("This job is no longer active");
        }

        if (applicationRepository.existsByJobIdAndApplicantId(
                jobId, applicant.getId())) {

            throw new RuntimeException("You have already applied for this job");
        }

        JobApplication application = new JobApplication();

        application.setJob(job);
        application.setApplicant(applicant);
        application.setResumePath(resumePath);
        application.setStatus(ApplicationStatus.PENDING);

        return applicationRepository.save(application);
    }

    // Get applications submitted by a job seeker
    public List<JobApplication> getMyApplications(String applicantEmail) {

        AppUser applicant = userRepository.findByEmail(applicantEmail)
                .orElseThrow(() -> new RuntimeException("Applicant not found"));

        return applicationRepository.findByApplicantId(applicant.getId());
    }

    // Recruiter views applicants for their job
@Transactional(readOnly = true)
public List<JobApplication> getJobApplications(
        Long jobId, String recruiterEmail) {

    Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

    if (!job.getRecruiter().getEmail().equals(recruiterEmail)) {
        throw new RuntimeException(
                "You cannot view another recruiter's applicants");
    }

    return applicationRepository.findByJobId(jobId);
}

    // Recruiter updates application status
    @Transactional
    public JobApplication updateApplicationStatus(
            Long applicationId,
            String status,
            String recruiterEmail) {

        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getJob().getRecruiter().getEmail()
                .equals(recruiterEmail)) {

            throw new RuntimeException("You cannot update this application");
        }

        ApplicationStatus newStatus;

        try {
            newStatus = ApplicationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new RuntimeException("Invalid application status");
        }

        application.setStatus(newStatus);

        return application;
    }
}
