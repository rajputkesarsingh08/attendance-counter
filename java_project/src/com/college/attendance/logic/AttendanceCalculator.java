package com.college.attendance.logic;

import com.college.attendance.model.Subject;
import java.util.List;

/**
 * Handles complex attendance calculations (Abstraction of business logic).
 */
public class AttendanceCalculator {
    
    public int calculateCanSkip(List<Subject> subjects, int targetPercentage) {
        int totalAttended = 0;
        int totalPossible = 0;
        
        for (Subject s : subjects) {
            totalAttended += s.getAttended();
            totalPossible += s.getTotal();
        }
        
        if (totalPossible == 0) return 0;
        
        // Formula: (Attended) / (Total + x) >= Target / 100
        int maxTotal = (totalAttended * 100) / targetPercentage;
        int skipDays = maxTotal - totalPossible;
        
        return Math.max(0, skipDays);
    }
    
    public int calculateRequiredToHitTarget(List<Subject> subjects, int targetPercentage) {
        int totalAttended = 0;
        int totalPossible = 0;
        
        for (Subject s : subjects) {
            totalAttended += s.getAttended();
            totalPossible += s.getTotal();
        }
        
        double current = totalPossible == 0 ? 0 : ((double)totalAttended / totalPossible) * 100;
        if (current >= targetPercentage) return 0;
        
        // Formula: (Attended + x) / (Total + x) >= Target / 100
        // (A + x) * 100 >= Target * (T + x)
        // 100A + 100x >= Target*T + Target*x
        // x(100 - Target) >= Target*T - 100A
        double numerator = (targetPercentage * totalPossible) - (100 * totalAttended);
        double denominator = 100 - targetPercentage;
        
        return (int) Math.ceil(numerator / denominator);
    }
}
