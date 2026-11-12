import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

public class ElectricityBillWebServer {
    private static final Path WEB_DIR = Path.of("web");

    public static void main(String[] args) throws Exception {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/calculate", ElectricityBillWebServer::calculate);
        server.createContext("/", ElectricityBillWebServer::serveFrontend);
        server.setExecutor(null);
        server.start();
        System.out.println("Electricity Bill Generator is running!");
        System.out.println("Open http://localhost:" + port + " in your browser.");
    }

    private static void serveFrontend(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        if (path.equals("/")) path = "/index.html";
        Path file = WEB_DIR.resolve(path.substring(1)).normalize();
        if (!file.startsWith(WEB_DIR) || !Files.exists(file) || Files.isDirectory(file)) {
            send(exchange, 404, "text/plain; charset=UTF-8", "File not found");
            return;
        }
        String type = path.endsWith(".css") ? "text/css; charset=UTF-8" :
                      path.endsWith(".js") ? "application/javascript; charset=UTF-8" :
                      "text/html; charset=UTF-8";
        byte[] data = Files.readAllBytes(file);
        exchange.getResponseHeaders().set("Content-Type", type);
        exchange.sendResponseHeaders(200, data.length);
        try (OutputStream os = exchange.getResponseBody()) { os.write(data); }
    }

    private static void calculate(HttpExchange exchange) throws IOException {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            send(exchange, 405, "application/json; charset=UTF-8", "{\"error\":\"POST method required\"}");
            return;
        }
        try {
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            Map<String, String> form = parseForm(body);
            String id = required(form, "consumerId");
            String name = required(form, "name");
            String address = required(form, "address");
            String meter = required(form, "meterNumber");
            int units = Integer.parseInt(required(form, "units"));
            if (units < 0) throw new IllegalArgumentException("Units cannot be negative.");
            if (units > 1000000) throw new IllegalArgumentException("Please enter a realistic units value.");

            // Reuse the existing OOP classes and tariff calculation from ElectricityBillGenerator.java
            Customer customer = new Customer(id, name, address, meter);
            DomesticBill bill = new DomesticBill(customer, units);
            bill.calculateBill();
            String json = "{\"consumerId\":\"" + escape(customer.getConsumerId()) +
                    "\",\"name\":\"" + escape(customer.getName()) +
                    "\",\"address\":\"" + escape(customer.getAddress()) +
                    "\",\"meterNumber\":\"" + escape(customer.getMeterNumber()) +
                    "\",\"units\":" + bill.unitsConsumed +
                    ",\"energyCharge\":" + String.format(java.util.Locale.US, "%.2f", bill.energyCharge) +
                    ",\"fixedCharge\":" + String.format(java.util.Locale.US, "%.2f", bill.fixedCharge) +
                    ",\"totalAmount\":" + String.format(java.util.Locale.US, "%.2f", bill.totalAmount) + "}";
            send(exchange, 200, "application/json; charset=UTF-8", json);
        } catch (Exception e) {
            send(exchange, 400, "application/json; charset=UTF-8", "{\"error\":\"" + escape(e.getMessage() == null ? "Invalid input" : e.getMessage()) + "\"}");
        }
    }

    private static Map<String, String> parseForm(String body) throws IOException {
        Map<String, String> map = new HashMap<>();
        for (String pair : body.split("&")) {
            String[] parts = pair.split("=", 2);
            String key = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
            String value = parts.length > 1 ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8) : "";
            map.put(key, value);
        }
        return map;
    }

    private static String required(Map<String, String> map, String key) {
        String value = map.get(key);
        if (value == null || value.trim().isEmpty()) throw new IllegalArgumentException("Please fill all fields.");
        return value.trim();
    }

    private static String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
    }

    private static void send(HttpExchange exchange, int status, String contentType, String body) throws IOException {
        byte[] data = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(status, data.length);
        try (OutputStream os = exchange.getResponseBody()) { os.write(data); }
    }
}
