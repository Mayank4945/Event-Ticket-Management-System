package com.events.service;

import com.events.model.Venue;
import com.events.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class VenueService {
    
    @Autowired
    private VenueRepository venueRepository;
    
    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }
    
    public Optional<Venue> getVenueById(String id) {
        return venueRepository.findById(id);
    }
    
    public Venue createVenue(Venue venue) {
        return venueRepository.save(venue);
    }
    
    public Optional<Venue> updateVenue(String id, Venue venue) {
        return venueRepository.findById(id)
                .map(existingVenue -> {
                    venue.setId(id);
                    return venueRepository.save(venue);
                });
    }
    
    public boolean deleteVenue(String id) {
        return venueRepository.findById(id)
                .map(venue -> {
                    venueRepository.delete(venue);
                    return true;
                })
                .orElse(false);
    }
}