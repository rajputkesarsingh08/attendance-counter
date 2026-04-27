package com.college.attendance.storage;

import com.college.attendance.model.Subject;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Concrete implementation of storage using File Handling and Serialization.
 */
public class FileStorage implements StorageProvider {
    private static final String FILE_PATH = "attendance_data.ser";

    @Override
    public void saveSubjects(List<Subject> subjects) throws Exception {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(FILE_PATH))) {
            oos.writeObject(subjects);
        } catch (IOException e) {
            throw new Exception("Error saving data to file system", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<Subject> loadSubjects() throws Exception {
        File file = new File(FILE_PATH);
        if (!file.exists()) return new ArrayList<>();

        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(FILE_PATH))) {
            return (List<Subject>) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
            throw new Exception("Error loading data. File might be corrupted.", e);
        }
    }
}
