# Smart Attendance Analyzer

Smart Attendance Analyzer is a beginner-friendly full-stack Java application for tracking subject attendance, spotting shortages early, and understanding how many lectures can be missed or still need to be attended.

## Features

- Java backend built with OOP using `Student`, `Subject`, and `AttendanceManager`
- Plain HTML, CSS, and JavaScript frontend
- Dynamic month generation from January to the current system month
- Attendance percentage calculation for every subject
- Default required attendance of 75%
- Warnings for low attendance and highlighted subject cards
- File storage using `data/subjects.txt`
- Responsive light dashboard UI

## Project Structure

```text
smart-attendance-analyzer/
|-- data/
|-- public/
|   |-- index.html
|   |-- styles.css
|   `-- script.js
|-- src/
|   `-- attendance/
|       |-- AttendanceManager.java
|       |-- AttendanceServer.java
|       |-- JsonUtils.java
|       |-- Student.java
|       `-- Subject.java
`-- README.md
```

## How to Run

1. Open a terminal in the `smart-attendance-analyzer` folder.
2. Compile the Java files:

```powershell
javac -d out src\attendance\*.java
```

3. Start the server:

```powershell
java -cp out attendance.AttendanceServer
```

4. Open your browser and visit:

```text
http://localhost:8080
```

## Notes

- Starter subjects are added automatically the first time you run the project.
- All saved subjects are stored in `data/subjects.txt`.
- If you want a fresh start, delete `data/subjects.txt` and restart the server.
