document.addEventListener("DOMContentLoaded", function () {
    loadJobs();
});


function loadJobs() {

    fetch("/api/jobs")
        .then(response => {

            if (!response.ok) {
                throw new Error("Unable to load jobs");
            }

            return response.json();
        })
        .then(jobs => {
            displayJobs(jobs);
        })
        .catch(error => {

            console.error(error);

            showMessage(
                "Unable to load jobs. Please try again.",
                "danger"
            );
        });
}


function searchJobs() {

    const title = document
        .getElementById("titleSearch")
        .value
        .trim();

    const location = document
        .getElementById("locationSearch")
        .value
        .trim();


    if (!title && !location) {
        loadJobs();
        return;
    }


    let url = "";

    if (title) {

        url = "/api/jobs/search/title?title="
            + encodeURIComponent(title);

    } else {

        url = "/api/jobs/search/location?location="
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

            console.error(error);

            showMessage(
                "Unable to search jobs.",
                "danger"
            );
        });
}


function displayJobs(jobs) {

    const jobsList =
        document.getElementById("jobsList");

    jobsList.innerHTML = "";


    if (!jobs || jobs.length === 0) {

        jobsList.innerHTML = `
            <div class="text-center py-5">

                <h4>No jobs found</h4>

                <p class="text-muted">
                    Try another job title or location.
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

            <div class="d-flex justify-content-between
                        align-items-start flex-wrap">

                <div>

                    <div class="job-title">
                        ${escapeHtml(job.title)}
                    </div>

                    <div class="company-name mt-1">
                        ${escapeHtml(job.companyName || "Company")}
                    </div>

                </div>

                <span class="badge bg-primary">
                    ${escapeHtml(job.employmentType || "Job")}
                </span>

            </div>


            <div class="job-meta mt-3">

                <span class="me-3">
                    📍 ${escapeHtml(job.location || "Not specified")}
                </span>

                <span>
                    💰 ${escapeHtml(job.salaryRange || "Not specified")}
                </span>

            </div>


            <p class="mt-3 text-muted">

                ${escapeHtml(
                    job.description || "No description available."
                )}

            </p>


            <div class="mt-3">

                <strong>Required Skills:</strong>

                <span class="text-muted">
                    ${escapeHtml(
                        job.requiredSkills || "Not specified"
                    )}
                </span>

            </div>


            <div class="mt-4">

                <a href="/login"
                   class="btn btn-primary">
                    Apply Now
                </a>

            </div>

        `;


        jobsList.appendChild(jobCard);
    });
}


function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showMessage(message, type) {

    const messageBox =
        document.getElementById("message");

    messageBox.textContent = message;

    messageBox.className =
        "alert alert-" + type;

    messageBox.classList.remove("d-none");
}