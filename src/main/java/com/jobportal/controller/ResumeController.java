
package com.jobportal.controller;

import com.jobportal.service.ResumeService;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping(
            value = "/seeker/applications/{applicationId}/resume",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> uploadResume(
            @PathVariable Long applicationId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String fileName = resumeService.uploadResume(
                applicationId,
                authentication.getName(),
                file
        );

        return ResponseEntity.ok(Map.of(
                "message", "Resume uploaded successfully",
                "applicationId", applicationId,
                "fileName", fileName
        ));
    }

    @GetMapping("/recruiter/applications/{applicationId}/resume")
    public ResponseEntity<Resource> downloadResume(
            @PathVariable Long applicationId,
            Authentication authentication) {

        Resource resource = resumeService.downloadResume(
                applicationId,
                authentication.getName()
        );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"resume.pdf\""
                )
                .body(resource);
    }
}
