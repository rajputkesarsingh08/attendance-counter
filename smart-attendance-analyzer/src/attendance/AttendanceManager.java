package attendance;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AttendanceManager {
    private final Student student;
    private final Path storagePath;

    public AttendanceManager(Student student, Path storagePath) {
        this.student = student;
        this.storagePath = storagePath;
    }

    public Student getStudent() {
        return student;
    }

    public synchronized void loadSubjects() throws IOException {
        student.getSubjects().clear();

        if (!Files.exists(storagePath)) {
            addStarterSubjects();
            return;
        }

        List<String> lines = Files.readAllLines(storagePath, StandardCharsets.UTF_8);
        for (String line : lines) {
            if (line == null || line.isBlank()) {
                continue;
            }

            String[] parts = line.split("\\|", -1);
            if (parts.length != 6) {
                continue;
            }

            Subject subject = new Subject(
                JsonUtils.unescapeStorage(parts[0]),
                JsonUtils.unescapeStorage(parts[1]),
                JsonUtils.unescapeStorage(parts[2]),
                Integer.parseInt(parts[3]),
                Integer.parseInt(parts[4]),
                Double.parseDouble(parts[5])
            );
            student.addSubject(subject);
        }

        if (student.getSubjects().isEmpty()) {
            addStarterSubjects();
        }
    }

    public synchronized Subject addSubject(String name, String priority, int totalLectures, int attendedLectures) throws IOException {
        validateSubject(name, priority, totalLectures, attendedLectures);

        Subject subject = new Subject(
            UUID.randomUUID().toString(),
            name.trim(),
            priority.trim().toUpperCase(),
            totalLectures,
            attendedLectures,
            student.getRequiredAttendance()
        );

        student.addSubject(subject);
        saveSubjects();
        return subject;
    }

    public synchronized void saveSubjects() throws IOException {
        List<String> lines = new ArrayList<>();
        for (Subject subject : student.getSubjects()) {
            lines.add(subject.toStorageLine());
        }

        Files.createDirectories(storagePath.getParent());
        Files.write(storagePath, lines, StandardCharsets.UTF_8);
    }

    public synchronized String buildDashboardJson() {
        StringBuilder builder = new StringBuilder();
        builder.append("{");
        builder.append("\"studentName\":").append(JsonUtils.quote(student.getName())).append(",");
        builder.append("\"requiredAttendance\":").append(student.getRequiredAttendance()).append(",");
        builder.append("\"currentDate\":").append(JsonUtils.quote(LocalDate.now().format(DateTimeFormatter.ISO_DATE))).append(",");
        builder.append("\"months\":").append(buildMonthsJson()).append(",");
        builder.append("\"summary\":").append(buildSummaryJson()).append(",");
        builder.append("\"subjects\":").append(buildSubjectsJson());
        builder.append("}");
        return builder.toString();
    }

    public synchronized String buildSuccessResponse(String message) {
        return "{\"success\":true,\"message\":" + JsonUtils.quote(message) + ",\"dashboard\":" + buildDashboardJson() + "}";
    }

    public synchronized String buildErrorResponse(String message) {
        return "{\"success\":false,\"message\":" + JsonUtils.quote(message) + "}";
    }

    private void validateSubject(String name, String priority, int totalLectures, int attendedLectures) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Subject name is required.");
        }

        if (priority == null || priority.isBlank()) {
            throw new IllegalArgumentException("Please choose a priority level.");
        }

        String normalizedPriority = priority.trim().toUpperCase();
        if (!normalizedPriority.equals("LOW") && !normalizedPriority.equals("MEDIUM") && !normalizedPriority.equals("HIGH")) {
            throw new IllegalArgumentException("Priority must be Low, Medium, or High.");
        }

        if (totalLectures <= 0) {
            throw new IllegalArgumentException("Total lectures must be greater than zero.");
        }

        if (attendedLectures < 0) {
            throw new IllegalArgumentException("Attended lectures cannot be negative.");
        }

        if (attendedLectures > totalLectures) {
            throw new IllegalArgumentException("Attended lectures cannot be greater than total lectures.");
        }
    }

    private String buildMonthsJson() {
        List<String> months = student.generateMonthsUntilCurrentDate();
        StringBuilder builder = new StringBuilder("[");
        for (int index = 0; index < months.size(); index++) {
            if (index > 0) {
                builder.append(",");
            }
            builder.append(JsonUtils.quote(months.get(index)));
        }
        builder.append("]");
        return builder.toString();
    }

    private String buildSummaryJson() {
        int totalLectures = 0;
        int attendedLectures = 0;
        int lowAttendanceCount = 0;
        int highPriorityCount = 0;

        for (Subject subject : student.getSubjects()) {
            totalLectures += subject.getTotalLectures();
            attendedLectures += subject.getAttendedLectures();

            if (subject.isBelowRequiredAttendance()) {
                lowAttendanceCount++;
            }

            if ("HIGH".equalsIgnoreCase(subject.getPriority())) {
                highPriorityCount++;
            }
        }

        double overallAttendance = totalLectures == 0 ? 0.0 : (attendedLectures * 100.0) / totalLectures;
        String status = overallAttendance >= student.getRequiredAttendance() ? "Safe zone" : "Needs attention";

        return "{"
            + "\"totalSubjects\":" + student.getSubjects().size() + ","
            + "\"totalLectures\":" + totalLectures + ","
            + "\"attendedLectures\":" + attendedLectures + ","
            + "\"overallAttendance\":" + String.format(java.util.Locale.US, "%.2f", overallAttendance) + ","
            + "\"lowAttendanceCount\":" + lowAttendanceCount + ","
            + "\"highPriorityCount\":" + highPriorityCount + ","
            + "\"status\":" + JsonUtils.quote(status)
            + "}";
    }

    private String buildSubjectsJson() {
        StringBuilder builder = new StringBuilder("[");

        for (int index = 0; index < student.getSubjects().size(); index++) {
            Subject subject = student.getSubjects().get(index);
            if (index > 0) {
                builder.append(",");
            }

            builder.append("{");
            builder.append("\"id\":").append(JsonUtils.quote(subject.getId())).append(",");
            builder.append("\"name\":").append(JsonUtils.quote(subject.getName())).append(",");
            builder.append("\"priority\":").append(JsonUtils.quote(subject.getPriority())).append(",");
            builder.append("\"totalLectures\":").append(subject.getTotalLectures()).append(",");
            builder.append("\"attendedLectures\":").append(subject.getAttendedLectures()).append(",");
            builder.append("\"attendancePercentage\":").append(String.format(java.util.Locale.US, "%.2f", subject.calculateAttendancePercentage())).append(",");
            builder.append("\"requiredAttendance\":").append(subject.getRequiredAttendance()).append(",");
            builder.append("\"lecturesCanMiss\":").append(subject.calculateLecturesCanMiss()).append(",");
            builder.append("\"lecturesNeeded\":").append(subject.calculateLecturesNeededForSafeZone()).append(",");
            builder.append("\"lowAttendance\":").append(subject.isBelowRequiredAttendance());
            builder.append("}");
        }

        builder.append("]");
        return builder.toString();
    }

    private void addStarterSubjects() throws IOException {
        student.addSubject(new Subject(UUID.randomUUID().toString(), "Data Structures", "HIGH", 32, 24, student.getRequiredAttendance()));
        student.addSubject(new Subject(UUID.randomUUID().toString(), "Operating Systems", "MEDIUM", 28, 22, student.getRequiredAttendance()));
        student.addSubject(new Subject(UUID.randomUUID().toString(), "Mathematics", "LOW", 30, 26, student.getRequiredAttendance()));
        saveSubjects();
    }
}
