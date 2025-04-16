package com.events.repository;

import com.events.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByPublishedTrue();
    
    List<Event> findByOrganizerId(String organizerId);
    
    @Query("{'title': {$regex: ?0, $options: 'i'}}")
    List<Event> findByTitleContaining(String title);
    
    @Query("{'categories': {$in: [?0]}}")
    List<Event> findByCategory(String category);
    
    @Query("{'venueId': ?0}")
    List<Event> findByVenue(String venueId);
    
    List<Event> findByEventDateAfter(LocalDateTime date);
}