document.addEventListener("DOMContentLoaded", function () {

    const token = sessionStorage.getItem("jwtToken");
    const role = sessionStorage.getItem("userRole");

    // Check login
    if (!token) {
        window.location.href = "/login";
        return;
    }

    // Check role
    if (role !== "JOB_SEEKER") {
        alert("Access denied. Job seekers only.");
        window.location.href = "/";
        return;
    }

    loadJobs();
    loadApplications();
});


// ==============================
// LOAD ALL JOBS
// ==============================

function loadJobs() {

    fetch("/api/jobs")
        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load jobs");
            }

            return response.json();
        })
        .then(jobs => {

            displayJobs(jobs);

        })
        .catch(error => {

            console.error("Jobs error:", error);

            showMessage(
                "Unable to load jobs.",
                "danger"
            );
        });
}


// ==============================
// SEARCH JOBS
// ==============================

function searchJobs() {

    const title =
        document.getElementById("titleSearch").value.trim();

    const location =
        document.getElementById("locationSearch").value.trim();


    if (!title && !location) {

        loadJobs();
        return;
    }


    let url;


    if (title) {

        url =
            "/api/jobs/search/title?title="
            + encodeURIComponent(title);

    } else {

        url =
            "/api/jobs/search/location?location="
            + encodeURIComponent(location);
    }


    fetch(url)
        .then(response => {

            if (!response.ok) {
                throw new Error("Search failed");
            }

            return response.json();
        })
        .then(jobs => {

            displayJobs(jobs);

        })
        .catch(error => {

            console.error("Search error:", error);

            showMessage(
                "Unable to search jobs.",
                "danger"
            );
        });
}


// ==============================
// DISPLAY JOBS
// ==============================

function displayJobs(jobs) {

    const jobsList =
        document.getElementById("jobsList");

    jobsList.innerHTML = "";


    if (!jobs || jobs.length === 0) {

        jobsList.innerHTML = `
            <div class="no-jobs">
                <h5>No jobs found</h5>

                <p>
                    Try searching with another job title or location.
                </p>
            </div>
        `;

        return;
    }


    jobs.forEach(job => {

        const jobCard =
            document.createElement("div");

        jobCard.className = "job-card";


        jobCard.innerHTML = `

            <div class="job-card-header">

                <div>

                    <div class="job-title">
                        ${escapeHtml(job.title)}
                    </div>

                    <div class="company-name mt-1">
                        ${escapeHtml(
                            job.companyName || "Company"
                        )}
                    </div>

                </div>

                <span class="badge bg-primary">
                    ${escapeHtml(
                        job.employmentType || "Job"
                    )}
                </span>

            </div>


            <div class="job-meta mt-3">

                <span>
                    📍 ${escapeHtml(
                        job.location || "Not specified"
                    )}
                </span>

            </div>


            <div class="job-meta mt-2">

                <span>
                    💰 ${escapeHtml(
                        job.salaryRange || "Not specified"
                    )}
                </span>

            </div>


            <div class="mt-3">

                <strong>Skills:</strong>

                <span class="text-muted">
                    ${escapeHtml(
                        job.requiredSkills || "Not specified"
                    )}
                </span>

            </div>


            <p class="mt-3 text-muted job-description">

                ${escapeHtml(
                    job.description ||
                    "No description available."
                )}

            </p>


            <button
                class="btn btn-primary w-100 mt-2"
                onclick="applyForJob(${job.id})">

                Apply Now

            </button>

        `;


        jobsList.appendChild(jobCard);
    });
}


// ==============================
// APPLY FOR JOB
// ==============================

function applyForJob(jobId) {

    const token =
        sessionStorage.getItem("jwtToken");


    fetch(`/api/seeker/jobs/${jobId}/apply`, {

        method: "POST",

        headers: {
            "Authorization": "Bearer " + token
        }

    })
        .then(response => {

            if (!response.ok) {

                return response.json()
                    .then(data => {

                        throw new Error(
                            data.message ||
                            "Unable to apply for job."
                        );
                    });
            }

            return response.json();
        })
        .then(application => {

            showMessage(
                "Application submitted successfully. Please upload your resume.",
                "success"
            );


            // Open PDF file picker
            const fileInput =
                document.createElement("input");

            fileInput.type = "file";
            fileInput.accept = ".pdf";


            fileInput.onchange = function () {

                const file =
                    fileInput.files[0];


                if (!file) {
                    return;
                }


                if (file.type !== "application/pdf") {

                    showMessage(
                        "Only PDF resumes are allowed.",
                        "danger"
                    );

                    return;
                }


                if (file.size > 5 * 1024 * 1024) {

                    showMessage(
                        "Resume must be less than 5 MB.",
                        "danger"
                    );

                    return;
                }


                uploadResume(
                    application.id,
                    file
                );
            };


            fileInput.click();

        })
        .catch(error => {

            console.error("Application error:", error);

            showMessage(
                error.message ||
                "Unable to apply for this job.",
                "danger"
            );
        });
}


// ==============================
// UPLOAD RESUME
// ==============================

function uploadResume(applicationId, file) {

    const token =
        sessionStorage.getItem("jwtToken");


    const formData =
        new FormData();

    formData.append("file", file);


    fetch(
        `/api/seeker/applications/${applicationId}/resume`,
        {

            method: "POST",

            headers: {
                "Authorization": "Bearer " + token
            },

            body: formData

        }
    )
        .then(response => {

            if (!response.ok) {

                return response.json()
                    .then(data => {

                        throw new Error(
                            data.message ||
                            "Resume upload failed."
                        );
                    });
            }

            return response.json();
        })
        .then(data => {

            showMessage(
                "Resume uploaded successfully.",
                "success"
            );

            loadApplications();

        })
        .catch(error => {

            console.error("Resume upload error:", error);

            showMessage(
                error.message ||
                "Unable to upload resume.",
                "danger"
            );
        });
}


// ==============================
// LOAD APPLICATIONS
// ==============================

function loadApplications() {

    const token =
        sessionStorage.getItem("jwtToken");


    fetch("/api/seeker/applications", {

        method: "GET",

        headers: {
            "Authorization": "Bearer " + token
        }

    })
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Failed to load applications"
                );
            }

            return response.json();
        })
        .then(applications => {

            displayApplications(applications);

        })
        .catch(error => {

            console.error(
                "Applications error:",
                error
            );

            document.getElementById(
                "applicationsList"
            ).innerHTML = `

                <tr>

                    <td colspan="5"
                        class="text-center text-danger">

                        Unable to load applications.

                    </td>

                </tr>

            `;
        });
}


// ==============================
// DISPLAY APPLICATIONS
// ==============================

function displayApplications(applications) {

    const applicationsList =
        document.getElementById("applicationsList");


    applicationsList.innerHTML = "";


    if (!applications ||
        applications.length === 0) {

        applicationsList.innerHTML = `

            <tr>

                <td colspan="5"
                    class="text-center text-muted">

                    You haven't applied for any jobs yet.

                </td>

            </tr>

        `;

        return;
    }


    applications.forEach(application => {

        const row =
            document.createElement("tr");


        const resumeStatus =
            application.resumePath &&
            application.resumePath.trim() !== ""
                ? "Uploaded"
                : "Not Uploaded";


        const formattedDate =
            formatDate(application.appliedAt);


        row.innerHTML = `

            <td>
                ${application.id}
            </td>

            <td>
                ${application.jobId ||
                application.job?.id ||
                "-"}
            </td>

            <td>

                <span class="badge ${
                    resumeStatus === "Uploaded"
                        ? "bg-success"
                        : "bg-secondary"
                }">

                    ${resumeStatus}

                </span>

            </td>

            <td>

                <span class="badge ${getStatusClass(
                    application.status
                )}">

                    ${application.status || "PENDING"}

                </span>

            </td>

            <td>
                ${formattedDate}
            </td>

        `;


        applicationsList.appendChild(row);
    });
}


// ==============================
// FORMAT DATE
// ==============================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {
        return "-";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ==============================
// STATUS BADGE
// ==============================

function getStatusClass(status) {

    switch (status) {

        case "PENDING":
            return "bg-primary";

        case "REVIEWED":
            return "bg-info text-dark";

        case "SHORTLISTED":
            return "bg-warning text-dark";

        case "ACCEPTED":
            return "bg-success";

        case "REJECTED":
            return "bg-danger";

        default:
            return "bg-secondary";
    }
}


// ==============================
// MESSAGE
// ==============================

function showMessage(message, type) {

    const messageBox =
        document.getElementById("message");


    messageBox.textContent =
        message;


    messageBox.className =
        "alert alert-" + type;


    messageBox.classList.remove("d-none");


    setTimeout(() => {

        messageBox.classList.add("d-none");

    }, 4000);
}


// ==============================
// HTML ESCAPE
// ==============================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}