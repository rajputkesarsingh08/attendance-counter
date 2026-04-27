package com.college.attendance.storage;

import com.college.attendance.model.Subject;
import java.util.List;

/**
 * Interface defining the contract for data storage (Abstraction/Polymorphism).
 */
public interface StorageProvider {
    void saveSubjects(List<Subject> subjects) throws Exception;
    List<Subject> loadSubjects() throws Exception;
}
