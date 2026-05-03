package attendance;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class JsonUtils {
    private JsonUtils() {
    }

    public static Map<String, String> parseSimpleJson(String json) {
        Map<String, String> values = new HashMap<>();
        if (json == null || json.isBlank()) {
            return values;
        }

        Pattern pattern = Pattern.compile("\"(.*?)\"\\s*:\\s*(\"(.*?)\"|-?\\d+(?:\\.\\d+)?)");
        Matcher matcher = pattern.matcher(json);

        while (matcher.find()) {
            String key = matcher.group(1);
            String rawValue = matcher.group(3) != null ? matcher.group(3) : matcher.group(2);
            values.put(key, unescapeJson(rawValue));
        }

        return values;
    }

    public static String quote(String value) {
        if (value == null) {
            return "\"\"";
        }

        return "\"" + value
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r") + "\"";
    }

    public static String unescapeJson(String value) {
        return value
            .replace("\\\"", "\"")
            .replace("\\n", "\n")
            .replace("\\r", "\r")
            .replace("\\\\", "\\");
    }

    public static String escapeStorage(String value) {
        if (value == null) {
            return "";
        }

        return value.replace("\\", "\\\\").replace("|", "\\p");
    }

    public static String unescapeStorage(String value) {
        if (value == null) {
            return "";
        }

        return value.replace("\\p", "|").replace("\\\\", "\\");
    }
}
