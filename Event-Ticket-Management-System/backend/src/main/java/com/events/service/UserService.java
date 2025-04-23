package com.events.service;

import com.events.model.User;
import com.events.model.UserStatus;
import com.events.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return Optional.ofNullable(userRepository.findByEmail(email));
    }
    
    public User createUser(User user) {
        // In a real application, you would encrypt the password here
        return userRepository.save(user);
    }
    
    public Optional<User> updateUser(String id, User user) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    user.setId(id);
                    // Don't update password if it's empty
                    if (user.getPassword() == null || user.getPassword().isEmpty()) {
                        user.setPassword(existingUser.getPassword());
                    } else {
                        // In a real application, you would encrypt the password here
                    }
                    return userRepository.save(user);
                });
    }
    
    public Optional<User> updateUserStatus(String id, UserStatus status) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setStatus(status);
                    return userRepository.save(user);
                });
    }
    
    public boolean deleteUser(String id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return true;
                })
                .orElse(false);
    }
}