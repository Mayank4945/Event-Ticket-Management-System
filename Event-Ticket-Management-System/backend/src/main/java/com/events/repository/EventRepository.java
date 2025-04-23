package com.events.repository;

import com.events.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Date;
import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByOrganizerId(String organizerId);
    List<Event> findByEventDateAfter(Date date);
    List<Event> findByPublishedTrue();
    List<Event> findByTitleContaining(String title);
    List<Event> findByCategory(String category);
    List<Event> findByVenue(String venueId);
    List<Event> findByCreatedAtAfter(Date date);
    List<Event> findByEventDateBetweenOrderByEventDateAsc(Date startDate, Date endDate);
}