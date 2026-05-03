const state = {
    selectedPriority: "MEDIUM",
};

const form = document.getElementById("subjectForm");
const messageBox = document.getElementById("messageBox");
const subjectCards = document.getElementById("subjectCards");
const monthsContainer = document.getElementById("monthsContainer");
const priorityButtons = document.querySelectorAll(".priority-btn");

priorityButtons.forEach((button) => {
    button.addEventListener("click", () => {
        priorityButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        state.selectedPriority = button.dataset.priority;
    });
});

priorityButtons[1].classList.add("active");

async function loadDashboard() {
    try {
        const response = await fetch("/api/dashboard");
        const data = await response.json();
        renderDashboard(data);
    } catch (error) {
        showMessage("Unable to load dashboard right now. Please restart the Java server.", "error");
    }
}

function renderDashboard(data) {
    document.getElementById("currentDate").textContent = formatDate(data.currentDate);
    document.getElementById("attendanceStatus").textContent = data.summary.status;
    document.getElementById("overallAttendance").textContent = `${data.summary.overallAttendance.toFixed(2)}%`;
    document.getElementById("summaryMessage").textContent =
        `Required attendance is ${data.requiredAttendance}%. Total lectures tracked: ${data.summary.totalLectures}.`;
    document.getElementById("lowAttendanceCount").textContent = data.summary.lowAttendanceCount;
    document.getElementById("highPriorityCount").textContent = data.summary.highPriorityCount;

    renderMonths(data.months);
    renderSubjects(data.subjects);
}

function renderMonths(months) {
    monthsContainer.innerHTML = months
        .map((month) => `<div class="month-chip">${month}</div>`)
        .join("");
}

function renderSubjects(subjects) {
    if (!subjects.length) {
        subjectCards.innerHTML = `<div class="subject-card"><h4>No subjects added yet.</h4><p>Add your first subject from the form above to start tracking attendance.</p></div>`;
        return;
    }

    subjectCards.innerHTML = subjects
        .map((subject) => {
            const priorityClass = subject.priority.toLowerCase();
            const warningMarkup = subject.lowAttendance
                ? `<div class="warning-tag">Attendance is below the safe 75% mark.</div>`
                : "";

            return `
                <article class="subject-card ${subject.lowAttendance ? "low-attendance" : ""}">
                    <div class="subject-topline">
                        <div>
                            <h4>${escapeHtml(subject.name)}</h4>
                            <p>${subject.attendedLectures} attended out of ${subject.totalLectures} lectures</p>
                        </div>
                        <span class="priority-tag ${priorityClass}">${subject.priority}</span>
                    </div>

                    <div class="attendance-ring">
                        <span class="card-label">Current Attendance</span>
                        <strong>${subject.attendancePercentage.toFixed(2)}%</strong>
                        <span>Required: ${subject.requiredAttendance}%</span>
                    </div>

                    <div class="subject-metrics">
                        <div>
                            <span class="card-label">Can Miss</span>
                            <strong>${subject.lecturesCanMiss}</strong>
                        </div>
                        <div>
                            <span class="card-label">Need To Attend</span>
                            <strong>${subject.lecturesNeeded}</strong>
                        </div>
                    </div>

                    <div class="subject-footer">
                        <div>
                            <span class="card-label">Status</span>
                            <strong>${subject.lowAttendance ? "Warning" : "Healthy"}</strong>
                        </div>
                    </div>

                    ${warningMarkup}
                </article>
            `;
        })
        .join("");
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("subjectName").value.trim();
    const totalLectures = Number(document.getElementById("totalLectures").value);
    const attendedLectures = Number(document.getElementById("attendedLectures").value);

    if (!name) {
        showMessage("Please enter a subject name.", "error");
        return;
    }

    if (!Number.isFinite(totalLectures) || totalLectures <= 0) {
        showMessage("Total lectures must be greater than zero.", "error");
        return;
    }

    if (!Number.isFinite(attendedLectures) || attendedLectures < 0) {
        showMessage("Attended lectures cannot be negative.", "error");
        return;
    }

    if (attendedLectures > totalLectures) {
        showMessage("Attended lectures cannot be greater than total lectures.", "error");
        return;
    }

    try {
        const response = await fetch("/api/subjects", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                priority: state.selectedPriority,
                totalLectures,
                attendedLectures,
            }),
        });

        const result = await response.json();
        showMessage(result.message, result.success ? "success" : "error");

        if (result.success) {
            form.reset();
            state.selectedPriority = "MEDIUM";
            priorityButtons.forEach((item) => item.classList.remove("active"));
            priorityButtons[1].classList.add("active");
            renderDashboard(result.dashboard);
        }
    } catch (error) {
        showMessage("Something went wrong while saving the subject.", "error");
    }
});

function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}

loadDashboard();
