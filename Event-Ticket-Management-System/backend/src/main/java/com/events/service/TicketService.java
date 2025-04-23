package com.events.service;

import com.events.model.Ticket;
import com.events.model.TicketType;  // Add this import
import com.events.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;

@Service
public class TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }
    
    public Optional<Ticket> getTicketById(String id) {
        return ticketRepository.findById(id);
    }
    
    public List<Ticket> getTicketsByEventId(String eventId) {
        return ticketRepository.findByEventId(eventId);
    }
    
    public List<Ticket> getTicketsByOrderId(String orderId) {
        return ticketRepository.findByOrderId(orderId);
    }
    
    public List<Ticket> getTicketsByUserId(String userId) {
        return ticketRepository.findByUserId(userId);
    }
    
    public Ticket createTicket(Ticket ticket) {
        // Generate a unique ticket number
        ticket.setTicketNumber(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return ticketRepository.save(ticket);
    }
    
    public Optional<Ticket> markTicketAsUsed(String id) {
        return ticketRepository.findById(id)
                .map(ticket -> {
                    ticket.setUsed(true);
                    return ticketRepository.save(ticket);
                });
    }
    
    public List<Ticket> createTickets(String eventId, String orderId, String userId, 
                                     TicketType type, int quantity, double unitPrice) {
        List<Ticket> tickets = new ArrayList<>();
        
        for (int i = 0; i < quantity; i++) {
            Ticket ticket = new Ticket();
            ticket.setEventId(eventId);
            ticket.setOrderId(orderId);
            ticket.setUserId(userId);
            ticket.setType(type);
            ticket.setPrice(unitPrice);
            ticket.setTicketNumber(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            
            tickets.add(ticketRepository.save(ticket));
        }
        
        return tickets;
    }
}