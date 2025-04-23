package com.events.service;

import com.events.model.Event;
import com.events.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {
    
    @Autowired
    private EventRepository eventRepository;
    
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
    
    public List<Event> getPublishedEvents() {
        return eventRepository.findByPublishedTrue();
    }
    
    public Optional<Event> getEventById(String id) {
        return eventRepository.findById(id);
    }
    
    public Event createEvent(Event event) {
        event.setPublished(false);
        event.setAvailableSeats(event.getTotalSeats());
        return eventRepository.save(event);
    }
    
    public Optional<Event> updateEvent(String id, Event updatedEvent) {
        return eventRepository.findById(id)
                .map(existingEvent -> {
                    updatedEvent.setId(id);
                    
                    // Preserve the original available seats if total seats haven't changed
                    if (existingEvent.getTotalSeats() == updatedEvent.getTotalSeats()) {
                        updatedEvent.setAvailableSeats(existingEvent.getAvailableSeats());
                    } else {
                        // Calculate new available seats based on the difference
                        int soldSeats = existingEvent.getTotalSeats() - existingEvent.getAvailableSeats();
                        updatedEvent.setAvailableSeats(Math.max(0, updatedEvent.getTotalSeats() - soldSeats));
                    }
                    
                    return eventRepository.save(updatedEvent);
                });
    }
    
    public boolean deleteEvent(String id) {
        return eventRepository.findById(id)
                .map(event -> {
                    eventRepository.delete(event);
                    return true;
                })
                .orElse(false);
    }
    
    public List<Event> searchEvents(String title, String category, String venueId) {
        if (title != null && !title.isEmpty()) {
            return eventRepository.findByTitleContaining(title);
        } else if (category != null && !category.isEmpty()) {
            return eventRepository.findByCategory(category);
        } else if (venueId != null && !venueId.isEmpty()) {
            return eventRepository.findByVenue(venueId);
        }
        
        return eventRepository.findByEventDateAfter(java.util.Date.from(LocalDateTime.now().atZone(java.time.ZoneId.systemDefault()).toInstant()));
    }
    
    public Optional<Event> publishEvent(String id) {
        return eventRepository.findById(id)
                .map(event -> {
                    event.setPublished(true);
                    return eventRepository.save(event);
                });
    }
    
    public Optional<Event> updateAvailableSeats(String id, int seatsSold) {
        return eventRepository.findById(id)
                .map(event -> {
                    int newAvailableSeats = event.getAvailableSeats() - seatsSold;
                    if (newAvailableSeats < 0) {
                        throw new IllegalStateException("Not enough seats available");
                    }
                    event.setAvailableSeats(newAvailableSeats);
                    return eventRepository.save(event);
                });
    }
    
    public List<Event> getEventsByOrganizerId(String organizerId) {
        return eventRepository.findByOrganizerId(organizerId);
    }
}