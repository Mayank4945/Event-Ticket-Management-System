package com.events.controller;

import com.events.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {
    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);
    
    @Autowired
    private DashboardService dashboardService;
    
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        try {
            logger.info("Received request for admin dashboard metrics");
            Map<String, Object> metrics = dashboardService.getDashboardMetrics();
            logger.info("Successfully retrieved admin dashboard metrics");
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            logger.error("Error in admin dashboard metrics", e);
            
            // Return a structured error response instead of 500
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            
            // Add basic dashboard data with zeros to avoid frontend errors
            errorResponse.put("userCount", 0);
            errorResponse.put("eventCount", 0);
            errorResponse.put("ticketCount", 0);
            errorResponse.put("revenue", 0.0);
            errorResponse.put("userGrowth", 0);
            errorResponse.put("eventGrowth", 0);
            errorResponse.put("ticketGrowth", 0);
            errorResponse.put("revenueGrowth", 0);
            errorResponse.put("topEvents", new ArrayList<>());
            errorResponse.put("recentUsers", new ArrayList<>());
            errorResponse.put("upcomingEvents", new ArrayList<>());
            
            Map<String, Object> usersByRole = new HashMap<>();
            usersByRole.put("customers", 0);
            usersByRole.put("organizers", 0);
            usersByRole.put("admins", 0);
            usersByRole.put("newUsers", 0);
            errorResponse.put("usersByRole", usersByRole);
            
            // Return 200 with error details instead of 500
            return ResponseEntity.ok(errorResponse);
        }
    }
    
    @GetMapping("/metrics/organizer/{organizerId}")
    public ResponseEntity<Map<String, Object>> getOrganizerDashboardMetrics(@PathVariable String organizerId) {
        logger.info("Received request for organizer dashboard metrics. Organizer ID: {}", organizerId);
        
        if (organizerId == null || organizerId.trim().isEmpty()) {
            logger.warn("Invalid organizer ID received");
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Organizer ID is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        try {
            Map<String, Object> metrics = dashboardService.getOrganizerDashboardMetrics(organizerId);
            
            if (metrics.containsKey("error")) {
                logger.error("Error in organizer dashboard service: {}", metrics.get("error"));
                return ResponseEntity.ok(metrics); // Still return 200 with error info
            }
            
            logger.info("Successfully retrieved organizer dashboard metrics for ID: {}", organizerId);
            return ResponseEntity.ok(metrics);
            
        } catch (Exception e) {
            logger.error("Unhandled exception in organizer dashboard metrics", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve organizer dashboard metrics: " + e.getMessage());
            errorResponse.put("eventCount", 0);
            errorResponse.put("ticketCount", 0);
            errorResponse.put("revenue", 0.0);
            errorResponse.put("attendeeCount", 0);
            
            return ResponseEntity.ok(errorResponse); // Return 200 with error info
        }
    }
}