package com.college.attendance.ui;

import javax.swing.*;
import java.awt.*;

/**
 * Main window for the Attendance Tracker using Java Swing.
 * Matches the reference design with a clean, centered layout.
 */
public class MainFrame extends JFrame {
    
    public MainFrame() {
        setTitle("Attendance Counter for College Students");
        setSize(1000, 700);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setBackground(Color.WHITE);
        
        setLayout(new BorderLayout());
        
        // Navigation bar (Top)
        JPanel navPanel = createNavPanel();
        add(navPanel, BorderLayout.NORTH);
        
        // Main Content Area
        JPanel contentPanel = new JPanel(new CardLayout());
        contentPanel.setBackground(Color.WHITE);
        // Pages would be added here...
        
        JLabel welcomeLabel = new JLabel("Manage your academic balance.", SwingConstants.CENTER);
        welcomeLabel.setFont(new Font("Inter", Font.BOLD, 32));
        add(welcomeLabel, BorderLayout.CENTER);
        
        // Footer
        JPanel footer = new JPanel();
        footer.setBackground(Color.WHITE);
        footer.add(new JLabel("BUILT FOR STUDENTS | OOP Project 2026"));
        add(footer, BorderLayout.SOUTH);
    }
    
    private JPanel createNavPanel() {
        JPanel p = new JPanel();
        p.setBackground(new Color(245, 245, 245));
        p.setPreferredSize(new Dimension(1000, 60));
        
        String[] tabs = {"Timetable", "Subjects", "Attendance"};
        for (String tab : tabs) {
            JButton b = new JButton(tab);
            b.setBorderPainted(false);
            b.setFocusPainted(false);
            b.setBackground(new Color(245, 245, 245));
            p.add(b);
        }
        
        return p;
    }
}
