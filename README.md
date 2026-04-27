# Student Attendance Counter (OOP Project)

This project is a complete attendance tracking solution for college students. It includes a modern web-based preview and a professional Java Swing desktop implementation.

## Project Structure (Java)

The Java implementation is located in the `/java_project` directory and follows these OOP principles:

- **Encapsulation:** All data models (Student, Subject, Attendance) use private fields with proper getters and setters.
- **Inheritance & Abstraction:** Uses an `AbstractPage` and `BaseManager` to reduce redundancy.
- **Interfaces:** Defines a `StorageProvider` interface for file-based saving/loading.
- **Polymorphism:** UI components are handled through common interfaces.

## Setup Instructions

### Web Version (Live Preview)
The live preview is running automatically. You can interact with the tabs (Timetable, Subjects, Attendance) and test the logic.

### Java Desktop Version
1. Copy the contents of the `/java_project` folder to your local machine.
2. Open the folder in any Java IDE (IntelliJ IDEA, Eclipse, or NetBeans).
3. Ensure you have JDK 17 or higher installed.
4. Run `Main.java` to start the desktop application.
