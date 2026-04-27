package com.college.attendance.exception;

/**
 * Custom Exception class for handling attendance-related errors.
 */
public class AttendanceException extends Exception {
    public AttendanceException(String message) {
        super(message);
    }
    
    public AttendanceException(String message, Throwable cause) {
        super(message, cause);
    }
}
