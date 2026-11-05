const RECRUITER_API = "/api";

function recruiterToken() {
    return sessionStorage.getItem("jwtToken");
}

function showRecruiterMessage(message, type = "success") {
    const box = document.getElementById("message");

    if (!box) {
        return;
    }

    box.className = `alert alert-${type}`;
    box.textContent = message;
}

function recruiterEscape(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

async function recruiterRequest(url, options = {}) {

    const response = await fetch(RECRUITER_API + url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${recruiterToken()}`
        }
    });

    if (!response.ok) {

        const error = await response.json().catch(() => null);

        throw new Error(
            error?.message ||
            error?.detail ||
            `Request failed: ${response.status}`
        );
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function checkRecruiterLogin() {

    if (
        !recruiterToken() ||
        sessionStorage.getItem("userRole") !== "RECRUITER"
    ) {
        window.location.href = "/login";
        return false;
    }

    return true;
}


// ========================================
// POST JOB
// ========================================

const jobForm = document.getElementById("jobForm");

if (jobForm) {

    jobForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const jobData = {
            title: document.getElementById("title").value.trim(),
            companyName: document.getElementById("companyName").value.trim(),
            location: document.getElementById("location").value.trim(),
            employmentType: document.getElementById("employmentType").value,
            salaryRange: document.getElementById("salaryRange").value.trim(),
            requiredSkills: document.getElementById("requiredSkills").value.trim(),
            description: document.getElementById("description").value.trim()
        };

        try {

            await recruiterRequest("/recruiter/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jobData)
            });

            showRecruiterMessage("Job posted successfully!");

            jobForm.reset();

            loadRecruiterJobs();

        } catch (error) {

            showRecruiterMessage(error.message, "danger");

        }
    });
}


// ========================================
// LOAD RECRUITER JOBS
// ========================================

async function loadRecruiterJobs() {

    const container = document.getElementById("recruiterJobs");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary"></div>
            <p class="mt-3">Loading your jobs...</p>
        </div>
    `;

    try {

        const jobs = await recruiterRequest("/recruiter/jobs");

        if (!Array.isArray(jobs) || jobs.length === 0) {

            container.innerHTML = `
                <div class="no-jobs">
                    <i class="bi bi-briefcase fs-2"></i>
                    <p class="mt-2">
                        You have not posted any jobs yet.
                    </p>
                </div>
            `;

            const applicantsList =
                document.getElementById("applicantsList");

            if (applicantsList) {

                applicantsList.innerHTML = `
                    <tr>
                        <td colspan="7">
                            No applicants available.
                        </td>
                    </tr>
                `;
            }

            return;
        }


        container.innerHTML = jobs.map(job => `

            <div class="col-md-6 col-lg-4">

                <div class="job-card">

                    <div class="job-card-header">

                        <div>
                            <h4>
                                ${recruiterEscape(job.title)}
                            </h4>

                            <p>
                                <strong>
                                    ${recruiterEscape(job.companyName)}
                                </strong>
                            </p>
                        </div>

                    </div>

                    <p>
                        <i class="bi bi-geo-alt"></i>
                        ${recruiterEscape(job.location)}
                    </p>

                    <p>
                        <i class="bi bi-briefcase"></i>
                        ${recruiterEscape(job.employmentType)}
                    </p>

                    <p>
                        <i class="bi bi-cash-stack"></i>
                        ${recruiterEscape(job.salaryRange)}
                    </p>

                    <button
                        class="btn btn-outline-primary w-100 mt-auto"
                        onclick="selectRecruiterJob(${Number(job.id)})">

                        <i class="bi bi-people"></i>
                        View Applicants

                    </button>

                </div>

            </div>

        `).join("");


        const applicantsList =
            document.getElementById("applicantsList");

        if (applicantsList) {

            applicantsList.innerHTML = `
                <tr>
                    <td colspan="7">
                        Select a job to view its applicants.
                    </td>
                </tr>
            `;
        }

    } catch (error) {

        container.innerHTML = `
            <div class="alert alert-danger">
                ${recruiterEscape(error.message)}
            </div>
        `;

    }
}


// ========================================
// SELECT JOB
// ========================================

function selectRecruiterJob(jobId) {

    sessionStorage.setItem(
        "currentRecruiterJobId",
        jobId
    );

    loadApplicants(jobId);
}


// ========================================
// LOAD APPLICANTS
// ========================================

async function loadApplicants(jobId) {

    const table =
        document.getElementById("applicantsList");

    if (!table) {
        return;
    }

    table.innerHTML = `
        <tr>
            <td colspan="7">
                Loading applicants...
            </td>
        </tr>
    `;

    try {

        const applications =
            await recruiterRequest(
                `/recruiter/jobs/${jobId}/applications`
            );


        if (
            !Array.isArray(applications) ||
            applications.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td colspan="7">
                        No applicants for this job.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML = applications.map(application => {

            const applicantName =
                application.applicant?.fullName ||
                application.applicantName ||
                application.fullName ||
                "N/A";


            const applicantEmail =
                application.applicant?.email ||
                application.applicantEmail ||
                application.email ||
                "N/A";


            const status =
                application.status || "PENDING";


            const appliedDate =
                application.appliedAt
                    ? new Date(application.appliedAt)
                        .toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        })
                    : "N/A";


            return `

                <tr>

                    <!-- Application ID -->
                    <td>
                        ${recruiterEscape(application.id)}
                    </td>


                    <!-- Applicant -->
                    <td>
                        ${recruiterEscape(applicantName)}
                    </td>


                    <!-- Email -->
                    <td>
                        ${recruiterEscape(applicantEmail)}
                    </td>


                    <!-- Resume -->
                    <td>

                        ${
                            application.resumePath
                                ? `
                                    <button
                                        class="btn btn-sm btn-success"
                                        onclick="downloadResume(${Number(application.id)})">

                                        <i class="bi bi-download"></i>
                                        Download

                                    </button>
                                  `
                                : `
                                    <span class="text-muted">
                                        Not uploaded
                                    </span>
                                  `
                        }

                    </td>


                    <!-- Status -->
                    <td>

                        <select
                            id="status-${Number(application.id)}"
                            class="form-select form-select-sm">

                            <option
                                value="PENDING"
                                ${status === "PENDING" ? "selected" : ""}>
                                Pending
                            </option>

                            <option
                                value="REVIEWED"
                                ${status === "REVIEWED" ? "selected" : ""}>
                                Reviewed
                            </option>

                            <option
                                value="SHORTLISTED"
                                ${status === "SHORTLISTED" ? "selected" : ""}>
                                Shortlisted
                            </option>

                            <option
                                value="REJECTED"
                                ${status === "REJECTED" ? "selected" : ""}>
                                Rejected
                            </option>

                            <option
                                value="ACCEPTED"
                                ${status === "ACCEPTED" ? "selected" : ""}>
                                Accepted
                            </option>

                        </select>

                    </td>


                    <!-- Applied Date -->
                    <td>
                        ${recruiterEscape(appliedDate)}
                    </td>


                    <!-- Action -->
                    <td>

                        <button
                            class="btn btn-sm btn-primary"
                            onclick="updateStatus(${Number(application.id)})">

                            <i class="bi bi-check2"></i>
                            Update

                        </button>

                    </td>

                </tr>

            `;

        }).join("");


    } catch (error) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-danger">
                    ${recruiterEscape(error.message)}
                </td>
            </tr>
        `;

    }
}


// ========================================
// UPDATE APPLICATION STATUS
// ========================================

async function updateStatus(applicationId) {

    const select =
        document.getElementById(`status-${applicationId}`);

    if (!select) {
        return;
    }

    const status = select.value;

    try {

        await recruiterRequest(
            `/recruiter/applications/${applicationId}/status?status=${encodeURIComponent(status)}`,
            {
                method: "PUT"
            }
        );

        showRecruiterMessage(
            "Application status updated successfully!"
        );

        const currentJobId =
            sessionStorage.getItem("currentRecruiterJobId");

        if (currentJobId) {
            loadApplicants(currentJobId);
        }

    } catch (error) {

        showRecruiterMessage(
            error.message,
            "danger"
        );

    }
}


// ========================================
// DOWNLOAD RESUME
// ========================================

async function downloadResume(applicationId) {

    try {

        const response = await fetch(
            `${RECRUITER_API}/recruiter/applications/${applicationId}/resume`,
            {
                headers: {
                    Authorization:
                        `Bearer ${recruiterToken()}`
                }
            }
        );

        if (!response.ok) {

            const error =
                await response.json().catch(() => null);

            throw new Error(
                error?.message ||
                "Unable to download resume."
            );
        }

        const blob =
            await response.blob();

        const downloadUrl =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = downloadUrl;

        link.download =
            `resume-${applicationId}.pdf`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(downloadUrl);

    } catch (error) {

        showRecruiterMessage(
            error.message,
            "danger"
        );

    }
}


// ========================================
// INITIAL LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!checkRecruiterLogin()) {
            return;
        }

        loadRecruiterJobs();

    }
);