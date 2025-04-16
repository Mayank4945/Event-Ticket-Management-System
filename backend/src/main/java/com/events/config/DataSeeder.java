package com.events.config;

import com.events.model.*;  // Import all models including UserRole
import com.events.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VenueRepository venueRepository;
    
    @Autowired
    private EventRepository eventRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedUsers();
        }
        
        if (venueRepository.count() == 0) {
            seedVenues();
        }
        
        if (eventRepository.count() == 0) {
            seedEvents();
        }
    }
    
    private void seedUsers() {
        User adminUser = new User();
        adminUser.setName("Admin User");
        adminUser.setEmail("admin@example.com");
        adminUser.setPassword("password");  // In a real app, use proper password hashing
        adminUser.setPhone("555-123-4567");
        adminUser.setRole(UserRole.ADMIN);  // Use the standalone enum
        
        User organizerUser = new User();
        organizerUser.setName("Event Organizer");
        organizerUser.setEmail("organizer@example.com");
        organizerUser.setPassword("password");
        organizerUser.setPhone("555-234-5678");
        organizerUser.setRole(UserRole.ORGANIZER);  // Use the standalone enum
        
        User customerUser = new User();
        customerUser.setName("John Customer");
        customerUser.setEmail("customer@example.com");
        customerUser.setPassword("password");
        customerUser.setPhone("555-345-6789");
        customerUser.setRole(UserRole.CUSTOMER);  // Use the standalone enum
        
        userRepository.saveAll(Arrays.asList(adminUser, organizerUser, customerUser));
    }
    
    private void seedVenues() {
        Venue venue1 = new Venue();
        venue1.setName("City Concert Hall");
        venue1.setCapacity(2000);
        venue1.setDescription("A prestigious concert hall in the heart of the city");
        venue1.setImageUrl("https://example.com/concert-hall.jpg");
        
        Address address1 = new Address();
        address1.setStreet("123 Main Street");
        address1.setCity("New York");
        address1.setState("NY");
        address1.setZipCode("10001");
        address1.setCountry("USA");
        venue1.setAddress(address1);
        
        Venue venue2 = new Venue();
        venue2.setName("Sports Arena");
        venue2.setCapacity(15000);
        venue2.setDescription("The city's largest sports and events venue");
        venue2.setImageUrl("https://example.com/sports-arena.jpg");
        
        Address address2 = new Address();
        address2.setStreet("456 Stadium Way");
        address2.setCity("New York");
        address2.setState("NY");
        address2.setZipCode("10002");
        address2.setCountry("USA");
        venue2.setAddress(address2);
        
        venueRepository.saveAll(Arrays.asList(venue1, venue2));
    }
    
    private void seedEvents() {
        // Get a venue and organizer for our events
        List<Venue> venues = venueRepository.findAll();
        List<User> organizers = userRepository.findAll().stream()
                .filter(user -> user.getRole() == UserRole.ORGANIZER)  // Use the standalone enum
                .toList();
        
        if (venues.isEmpty() || organizers.isEmpty()) {
            return;
        }
        
        Venue venue = venues.get(0);
        User organizer = organizers.get(0);
        
        Event event1 = new Event();
        event1.setTitle("Summer Music Festival");
        event1.setDescription("A day of amazing music performances from top artists");
        event1.setEventDate(LocalDateTime.now().plusDays(30));
        event1.setEndDate(LocalDateTime.now().plusDays(30).plusHours(8));
        event1.setVenueId(venue.getId());
        event1.setOrganizerId(organizer.getId());
        event1.setImageUrl("https://example.com/music-festival.jpg");
        event1.setCategories(Arrays.asList("Music", "Festival", "Summer"));
        event1.setPublished(true);
        event1.setTotalSeats(1000);
        event1.setAvailableSeats(1000);
        event1.setBasePrice(75.0);
        
        Event event2 = new Event();
        event2.setTitle("Tech Conference 2025");
        event2.setDescription("The latest innovations and insights from tech industry leaders");
        event2.setEventDate(LocalDateTime.now().plusDays(60));
        event2.setEndDate(LocalDateTime.now().plusDays(62));
        event2.setVenueId(venue.getId());
        event2.setOrganizerId(organizer.getId());
        event2.setImageUrl("https://example.com/tech-conference.jpg");
        event2.setCategories(Arrays.asList("Technology", "Conference", "Business"));
        event2.setPublished(true);
        event2.setTotalSeats(500);
        event2.setAvailableSeats(500);
        event2.setBasePrice(299.0);
        
        eventRepository.saveAll(Arrays.asList(event1, event2));
    }
}