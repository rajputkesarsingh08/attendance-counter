package attendance;

public class Subject {
    private String id;
    private String name;
    private String priority;
    private int totalLectures;
    private int attendedLectures;
    private double requiredAttendance;

    public Subject(String id, String name, String priority, int totalLectures, int attendedLectures, double requiredAttendance) {
        this.id = id;
        this.name = name;
        this.priority = priority;
        this.totalLectures = totalLectures;
        this.attendedLectures = attendedLectures;
        this.requiredAttendance = requiredAttendance;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public int getTotalLectures() {
        return totalLectures;
    }

    public void setTotalLectures(int totalLectures) {
        this.totalLectures = totalLectures;
    }

    public int getAttendedLectures() {
        return attendedLectures;
    }

    public void setAttendedLectures(int attendedLectures) {
        this.attendedLectures = attendedLectures;
    }

    public double getRequiredAttendance() {
        return requiredAttendance;
    }

    public void setRequiredAttendance(double requiredAttendance) {
        this.requiredAttendance = requiredAttendance;
    }

    public double calculateAttendancePercentage() {
        if (totalLectures <= 0) {
            return 0.0;
        }
        return (attendedLectures * 100.0) / totalLectures;
    }

    public int calculateLecturesCanMiss() {
        if (totalLectures <= 0) {
            return 0;
        }

        double allowedAbsences = totalLectures - ((requiredAttendance / 100.0) * totalLectures);
        double currentAbsences = totalLectures - attendedLectures;
        int remainingMisses = (int) Math.floor(allowedAbsences - currentAbsences);
        return Math.max(remainingMisses, 0);
    }

    public int calculateLecturesNeededForSafeZone() {
        if (totalLectures <= 0) {
            return 0;
        }

        if (calculateAttendancePercentage() >= requiredAttendance) {
            return 0;
        }

        int extraLectures = 0;
        while (((attendedLectures + extraLectures) * 100.0) / (totalLectures + extraLectures) < requiredAttendance) {
            extraLectures++;
        }
        return extraLectures;
    }

    public boolean isBelowRequiredAttendance() {
        return calculateAttendancePercentage() < requiredAttendance;
    }

    public String toStorageLine() {
        return String.join("|",
            JsonUtils.escapeStorage(id),
            JsonUtils.escapeStorage(name),
            JsonUtils.escapeStorage(priority),
            String.valueOf(totalLectures),
            String.valueOf(attendedLectures),
            String.valueOf(requiredAttendance)
        );
    }
}
