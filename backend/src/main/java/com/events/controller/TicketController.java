package com.events.controller;

import com.events.model.Ticket;
import com.events.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {
    
    @Autowired
    private TicketService ticketService;
    
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Ticket>> getTicketsByEventId(@PathVariable String eventId) {
        return ResponseEntity.ok(ticketService.getTicketsByEventId(eventId));
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Ticket>> getTicketsByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(ticketService.getTicketsByOrderId(orderId));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getTicketsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(ticketService.getTicketsByUserId(userId));
    }
    
    @PutMapping("/{id}/use")
    public ResponseEntity<Ticket> markTicketAsUsed(@PathVariable String id) {
        return ticketService.markTicketAsUsed(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}