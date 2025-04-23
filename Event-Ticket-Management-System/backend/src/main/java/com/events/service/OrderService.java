package com.events.service;

import com.events.model.Order;
import com.events.model.OrderStatus;
import com.events.model.Ticket;
import com.events.model.TicketType;
import com.events.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private TicketService ticketService;
    
    @Autowired
    private EventService eventService;
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }
    
    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId);
    }
    
    public Order createOrder(String userId, String eventId, TicketType ticketType, 
                        int quantity, double unitPrice, String paymentMethod) {
        try {
            // First, check if there are enough seats
            com.events.model.Event event = eventService.getEventById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));
            
            if (event.getAvailableSeats() < quantity) {
                throw new IllegalStateException("Not enough seats available");
            }
            
            // Create the order
            Order order = new Order();
            order.setUserId(userId);
            order.setEventId(eventId);  // Set the eventId
            order.setQuantity(quantity);  // Set the quantity
            order.setUnitPrice(unitPrice);  // Set the unitPrice
            order.setTicketType(ticketType.toString());  // Set the ticketType
            order.setTotalAmount(unitPrice * quantity);
            order.setPaymentMethod(paymentMethod);
            order.setTransactionId(UUID.randomUUID().toString());
            order.setStatus(OrderStatus.COMPLETED.name());
            
            // Save the order to get an id
            Order savedOrder = orderRepository.save(order);
            
            // Create tickets for this order
            List<Ticket> tickets = ticketService.createTickets(
                eventId, savedOrder.getId(), userId, ticketType, quantity, unitPrice);
            
            // Update the order with ticket ids
            savedOrder.setTicketIds(tickets.stream().map(Ticket::getId).collect(Collectors.toList()));
            orderRepository.save(savedOrder);
            
            // Update available seats
            eventService.updateAvailableSeats(eventId, quantity);
            
            return savedOrder;
        } catch (Exception e) {
            // Log the error for debugging
            e.printStackTrace();
            throw e; // Re-throw to be handled by the controller
        }
    }
    
    public Optional<Order> cancelOrder(String id) {
        return orderRepository.findById(id)
                .map(order -> {
                    if (!order.getStatus().equals(OrderStatus.COMPLETED.name())) {
                        throw new IllegalStateException("Cannot cancel an order that is not completed");
                    }
                    
                    order.setStatus(OrderStatus.CANCELED.name());
                    
                    // Get the event id from one of the tickets
                    List<Ticket> tickets = ticketService.getTicketsByOrderId(id);
                    if (!tickets.isEmpty()) {
                        String eventId = tickets.get(0).getEventId();
                        // Restore the available seats
                        eventService.updateAvailableSeats(eventId, -tickets.size());
                    }
                    
                    return orderRepository.save(order);
                });
    }
}