package com.events.repository;

import com.events.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Date;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserId(String userId);
    List<Order> findByEventId(String eventId);
    List<Order> findByEventIdIn(List<String> eventIds);
    List<Order> findByCreatedAtAfter(Date date);
}