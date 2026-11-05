
package com.jobportal.service;

import com.jobportal.entity.JobApplication;
import com.jobportal.repository.JobApplicationRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ResumeService {

    private final JobApplicationRepository applicationRepository;

    @Value("${app.upload.dir}")
    private String uploadDirectory;

    public ResumeService(JobApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @Transactional
    public String uploadResume(
            Long applicationId,
            String applicantEmail,
            MultipartFile file) {

        JobApplication application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Application not found"));

        if (!application.getApplicant().getEmail().equals(applicantEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can upload a resume only to your own application");
        }

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select a PDF file");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "File size must not exceed 5 MB");
        }

        String originalName = file.getOriginalFilename();

        if (originalName == null ||
                !originalName.toLowerCase().endsWith(".pdf")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Only PDF files are allowed");
        }

        // Validate PDF signature within the first 1024 bytes
        try (InputStream inputStream = file.getInputStream()) {

            byte[] header = inputStream.readNBytes(1024);

            String headerText = new String(
                    header, StandardCharsets.ISO_8859_1);

            if (!headerText.contains("%PDF-")) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid PDF file");
            }

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Unable to read uploaded file");
        }

        try {
            Path directory = Paths.get(uploadDirectory)
                    .toAbsolutePath().normalize();

            Files.createDirectories(directory);

            String storedFileName = UUID.randomUUID() + ".pdf";

            Path destination = directory.resolve(storedFileName);

            file.transferTo(destination);

            application.setResumePath(storedFileName);

            applicationRepository.save(application);

            return storedFileName;

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to save resume");
        }
    }

    @Transactional(readOnly = true)
    public Resource downloadResume(
            Long applicationId,
            String recruiterEmail) {

        JobApplication application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Application not found"));

        if (!application.getJob().getRecruiter()
                .getEmail().equals(recruiterEmail)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot download this resume");
        }

        String fileName = application.getResumePath();

        if (fileName == null || fileName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No resume uploaded for this application");
        }

        try {
            Path directory = Paths.get(uploadDirectory)
                    .toAbsolutePath().normalize();

            Path filePath = directory.resolve(fileName).normalize();

            if (!filePath.startsWith(directory)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid file path");
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Resume file not found");
            }

            return resource;

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to download resume");
        }
    }
}
