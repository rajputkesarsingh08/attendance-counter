package attendance;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class Student {
    private String name;
    private double requiredAttendance;
    private final List<Subject> subjects;

    public Student(String name, double requiredAttendance) {
        this.name = name;
        this.requiredAttendance = requiredAttendance;
        this.subjects = new ArrayList<>();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getRequiredAttendance() {
        return requiredAttendance;
    }

    public void setRequiredAttendance(double requiredAttendance) {
        this.requiredAttendance = requiredAttendance;
    }

    public List<Subject> getSubjects() {
        return subjects;
    }

    public void addSubject(Subject subject) {
        subjects.add(subject);
    }

    public List<String> generateMonthsUntilCurrentDate() {
        LocalDate today = LocalDate.now();
        List<String> months = new ArrayList<>();

        for (int monthNumber = Month.JANUARY.getValue(); monthNumber <= today.getMonthValue(); monthNumber++) {
            Month month = Month.of(monthNumber);
            months.add(month.getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
        }

        return months;
    }
}
