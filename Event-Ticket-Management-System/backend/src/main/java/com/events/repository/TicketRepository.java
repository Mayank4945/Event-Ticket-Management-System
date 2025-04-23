package com.events.repository;

import com.events.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByEventId(String eventId);
    
    List<Ticket> findByOrderId(String orderId);
    
    List<Ticket> findByUserId(String userId);
    
    List<Ticket> findByEventIdAndUserId(String eventId, String userId);
}