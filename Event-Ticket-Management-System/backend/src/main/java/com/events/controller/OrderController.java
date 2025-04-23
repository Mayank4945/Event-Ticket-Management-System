package com.events.controller;

import com.events.model.Order;
import com.events.model.TicketType;
import com.events.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;  // Add this import statement
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUserId(@PathVariable String userId) {
        return orderService.getOrdersByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderRequest) {
        try {
            String userId = (String) orderRequest.get("userId");
            String eventId = (String) orderRequest.get("eventId");
            String ticketTypeStr = (String) orderRequest.get("ticketType");
            TicketType ticketType = TicketType.valueOf(ticketTypeStr);
            int quantity = Integer.parseInt(orderRequest.get("quantity").toString());
            double unitPrice = Double.parseDouble(orderRequest.get("unitPrice").toString());
            String paymentMethod = (String) orderRequest.get("paymentMethod");

            // Add logging to debug
            System.out.println("Creating order with: userId=" + userId + ", eventId=" + eventId + 
                               ", ticketType=" + ticketType + ", quantity=" + quantity + 
                               ", unitPrice=" + unitPrice + ", paymentMethod=" + paymentMethod);

            Order order = orderService.createOrder(userId, eventId, ticketType, quantity, unitPrice, paymentMethod);
            return ResponseEntity.ok(order);
        } catch (IllegalStateException e) {
            // Handle business logic errors (like not enough seats)
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            // Return the actual error message for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating order: " + e.getMessage());
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Order> createOrderWithParams(
            @RequestParam String userId,
            @RequestParam String eventId,
            @RequestParam TicketType ticketType,
            @RequestParam int quantity,
            @RequestParam double unitPrice,
            @RequestParam String paymentMethod) {
        
        try {
            Order order = orderService.createOrder(userId, eventId, ticketType, quantity, unitPrice, paymentMethod);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}