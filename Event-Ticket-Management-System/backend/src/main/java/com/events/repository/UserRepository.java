package com.events.repository;

import com.events.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Date;
import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
    List<User> findByCreatedAtAfter(Date date);
    List<User> findByCreatedAtAfterOrderByCreatedAtDesc(Date date);
}