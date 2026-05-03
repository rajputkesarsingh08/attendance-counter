package attendance;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.Executors;

public class AttendanceServer {
    private static final int PORT = 8080;

    public static void main(String[] args) throws IOException {
        Path projectRoot = Path.of("").toAbsolutePath();
        Path storagePath = projectRoot.resolve("data").resolve("subjects.txt");
        Student student = new Student("Demo Student", 75.0);
        AttendanceManager manager = new AttendanceManager(student, storagePath);
        manager.loadSubjects();

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/api/dashboard", new DashboardHandler(manager));
        server.createContext("/api/subjects", new SubjectHandler(manager));
        server.createContext("/", new StaticFileHandler(projectRoot.resolve("public")));
        server.setExecutor(Executors.newFixedThreadPool(8));
        server.start();

        System.out.println("Smart Attendance Analyzer is running on http://localhost:" + PORT);
    }

    private static class DashboardHandler implements HttpHandler {
        private final AttendanceManager manager;

        private DashboardHandler(AttendanceManager manager) {
            this.manager = manager;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, manager.buildErrorResponse("Only GET is allowed for this endpoint."));
                return;
            }

            sendJson(exchange, 200, manager.buildDashboardJson());
        }
    }

    private static class SubjectHandler implements HttpHandler {
        private final AttendanceManager manager;

        private SubjectHandler(AttendanceManager manager) {
            this.manager = manager;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, manager.buildErrorResponse("Only POST is allowed for this endpoint."));
                return;
            }

            String body = readRequestBody(exchange.getRequestBody());
            Map<String, String> data = JsonUtils.parseSimpleJson(body);

            try {
                String name = data.get("name");
                String priority = data.get("priority");
                int totalLectures = Integer.parseInt(data.getOrDefault("totalLectures", "0"));
                int attendedLectures = Integer.parseInt(data.getOrDefault("attendedLectures", "0"));

                manager.addSubject(name, priority, totalLectures, attendedLectures);
                sendJson(exchange, 201, manager.buildSuccessResponse("Subject added successfully."));
            } catch (NumberFormatException exception) {
                sendJson(exchange, 400, manager.buildErrorResponse("Please enter valid numbers for lecture counts."));
            } catch (IllegalArgumentException exception) {
                sendJson(exchange, 400, manager.buildErrorResponse(exception.getMessage()));
            }
        }
    }

    private static class StaticFileHandler implements HttpHandler {
        private final Path publicDirectory;

        private StaticFileHandler(Path publicDirectory) {
            this.publicDirectory = publicDirectory;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String requestedPath = exchange.getRequestURI().getPath();
            String fileName = "/".equals(requestedPath) ? "index.html" : requestedPath.substring(1);
            Path filePath = publicDirectory.resolve(fileName).normalize();

            if (!filePath.startsWith(publicDirectory) || !Files.exists(filePath) || Files.isDirectory(filePath)) {
                sendText(exchange, 404, "File not found.", "text/plain");
                return;
            }

            byte[] content = Files.readAllBytes(filePath);
            sendBytes(exchange, 200, content, detectContentType(fileName));
        }
    }

    private static String readRequestBody(InputStream inputStream) throws IOException {
        return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
    }

    private static String detectContentType(String fileName) {
        if (fileName.endsWith(".css")) {
            return "text/css; charset=utf-8";
        }
        if (fileName.endsWith(".js")) {
            return "application/javascript; charset=utf-8";
        }
        return "text/html; charset=utf-8";
    }

    private static void sendJson(HttpExchange exchange, int statusCode, String json) throws IOException {
        sendBytes(exchange, statusCode, json.getBytes(StandardCharsets.UTF_8), "application/json; charset=utf-8");
    }

    private static void sendText(HttpExchange exchange, int statusCode, String body, String contentType) throws IOException {
        sendBytes(exchange, statusCode, body.getBytes(StandardCharsets.UTF_8), contentType);
    }

    private static void sendBytes(HttpExchange exchange, int statusCode, byte[] content, String contentType) throws IOException {
        Headers headers = exchange.getResponseHeaders();
        headers.set("Content-Type", contentType);
        headers.set("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(statusCode, content.length);

        try (OutputStream outputStream = exchange.getResponseBody()) {
            outputStream.write(content);
        }
    }
}
