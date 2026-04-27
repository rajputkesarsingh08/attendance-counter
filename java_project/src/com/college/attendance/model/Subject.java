package com.college.attendance.model;

import java.io.Serializable;

/**
 * Encapsulates Subject data using OOP principles.
 */
public class Subject implements Serializable {
    private String id;
    private String name;
    private int attended;
    private int total;

    public Subject(String id, String name, int attended, int total) {
        this.id = id;
        this.name = name;
        this.attended = attended;
        this.total = total;
    }

    // Getters and Setters (Encapsulation)
    public String getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAttended() { return attended; }
    public void setAttended(int attended) { this.attended = attended; }
    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public double getPercentage() {
        if (total == 0) return 0;
        return ((double) attended / total) * 100;
    }
}
