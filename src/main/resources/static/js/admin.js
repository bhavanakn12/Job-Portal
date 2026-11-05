document.addEventListener("DOMContentLoaded", function () {

    const token = sessionStorage.getItem("jwtToken");
    const role = sessionStorage.getItem("userRole");

    // Check login
    if (!token) {
        window.location.href = "/login";
        return;
    }

    // Check admin role
    if (role !== "ADMIN") {
        alert("Access denied. Admin only.");
        window.location.href = "/";
        return;
    }

    loadStatistics();
    loadUsers();
});


function loadStatistics() {

    const token = sessionStorage.getItem("jwtToken");

    fetch("/api/admin/stats", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(response => {

        if (!response.ok) {
            throw new Error("Failed to load statistics");
        }

        return response.json();
    })
    .then(data => {

        document.getElementById("totalUsers").textContent =
            data.totalUsers;

        document.getElementById("totalSeekers").textContent =
            data.totalSeekers;

        document.getElementById("totalRecruiters").textContent =
            data.totalRecruiters;

        document.getElementById("totalJobs").textContent =
            data.totalJobs;
    })
    .catch(error => {

        console.error("Statistics error:", error);

        showAdminMessage(
            "Unable to load dashboard statistics.",
            "danger"
        );
    });
}


function loadUsers() {

    const token = sessionStorage.getItem("jwtToken");

    fetch("/api/admin/users", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(response => {

        if (!response.ok) {
            throw new Error("Failed to load users");
        }

        return response.json();
    })
    .then(users => {

        const usersList = document.getElementById("usersList");

        usersList.innerHTML = "";

        if (users.length === 0) {

            usersList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        No users found.
                    </td>
                </tr>
            `;

            return;
        }

        users.forEach(user => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>
                    <span class="badge bg-primary">
                        ${user.role}
                    </span>
                </td>
                <td>${formatDate(user.createdAt)}</td>
            `;

            usersList.appendChild(row);
        });
    })
    .catch(error => {

        console.error("Users error:", error);

        const usersList = document.getElementById("usersList");

        usersList.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Unable to load users.
                </td>
            </tr>
        `;
    });
}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}


function showAdminMessage(message, type) {

    const messageBox = document.getElementById("message");

    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;

    messageBox.className =
        "alert alert-" + type;

    messageBox.classList.remove("d-none");
}