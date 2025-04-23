"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Button, Card, Container, Grid, Typography, Box, Chip, 
  CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Select, FormControl, 
  InputLabel, Paper, Divider, Avatar
} from '@mui/material';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUser, FaTicketAlt, FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/auth-context';

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;  // Changed from date
  endDate: string;    // Added to match backend
  venueId: string;    // Added to match backend
  venueName?: string; // Added for display
  organizerId: string; // Changed from organizer
  organizer?: string; // Added for display
  imageUrl: string;
  basePrice: number;  // Changed from ticketPrice
  availableSeats: number; // Changed from availableTickets
  totalSeats: number; // Added to match backend
  categories: string[]; // Changed from category string
  published: boolean; // Added to match backend
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [openBuyDialog, setOpenBuyDialog] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/events/${eventId}`);
        
        console.log("Raw event data:", response.data);
        console.log("Raw basePrice:", response.data.basePrice, "Type:", typeof response.data.basePrice);
        
        // Ensure the price is properly parsed as a number
        const eventData = {
          ...response.data,
          basePrice: parseFloat(response.data.basePrice) || 0
        };
        
        console.log("Parsed basePrice:", eventData.basePrice, "Type:", typeof eventData.basePrice);
        
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const handleBuyTickets = () => {
    setOpenBuyDialog(true);
  };

  const handleCloseBuyDialog = () => {
    setOpenBuyDialog(false);
  };

  const handlePurchaseTickets = async () => {
    if (!buyerName || !buyerEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setPurchaseLoading(true);
      
      const orderPayload = {
        userId: isAuthenticated ? user?.id : buyerEmail,
        eventId: eventId,
        ticketType: 'STANDARD',
        quantity: ticketQuantity,
        unitPrice: event?.basePrice || 0,
        paymentMethod: 'CREDIT_CARD'
      };
      
      console.log('Sending order payload:', orderPayload); // Debug log
      
      const response = await axios.post('http://localhost:8080/api/orders', orderPayload);
      
      toast.success('Tickets purchased successfully!');
      setOpenBuyDialog(false);
      
      // Refresh event data to update available tickets
      const updatedEvent = await axios.get(`http://localhost:8080/api/events/${eventId}`);
      setEvent(updatedEvent.data);
      
      // Redirect to tickets page or show confirmation
      router.push(`/my-tickets`);
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      toast.error(`Failed to purchase tickets: ${axios.isAxiosError(error) ? error.response?.data || error.message : 'Unknown error'}`);
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>Event not found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The event you're looking for might have been removed or is not available.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<FaArrowLeft />}
            onClick={() => router.push('/events')} 
            sx={{ mt: 2 }}
          >
            Back to Events
          </Button>
        </Paper>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button 
        variant="outlined" 
        startIcon={<FaArrowLeft />}
        onClick={() => router.push('/events')} 
        sx={{ mb: 4 }}
      >
        Back to Events
      </Button>
      
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 6 }}>
        <Grid container>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', width: '100%', height: 500, overflow: 'hidden' }}>
              {event.imageUrl ? (
                <Image 
                  src={event.imageUrl.startsWith('http') ? event.imageUrl : `http://localhost:8080${event.imageUrl.startsWith('/') ? '' : '/'}${event.imageUrl}`}
                  alt={event.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent infinite loop
                    target.src = 'https://via.placeholder.com/800x500?text=Event+Image'; // Online placeholder
                  }}
                />
              ) : (
                <Box sx={{ 
                  width: '100%', 
                  height: '100%', 
                  bgcolor: 'grey.200',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3
                }}>
                  <FaTicketAlt style={{ fontSize: 48, color: 'rgba(0, 0, 0, 0.2)', marginBottom: 16 }} />
                  <Typography variant="body1" color="text.secondary" align="center">
                    No image available for this event
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 'auto' }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {event.categories?.map((category, index) => (
                    <Chip 
                      key={index}
                      label={category} 
                      color="primary" 
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                  )) || (
                    <Chip 
                      label="Uncategorized" 
                      color="primary" 
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                </Box>
                
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                  {event.title}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1, 
                  p: 1.5, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <FaCalendarAlt style={{ marginRight: 12, color: 'rgba(0, 0, 0, 0.6)', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Date</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(event.eventDate)}
                      {event.endDate && event.endDate !== event.eventDate && 
                        ` - ${formatDate(event.endDate)}`}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1, 
                  p: 1.5, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <FaClock style={{ marginRight: 12, color: 'rgba(0, 0, 0, 0.6)', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Time</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date(event.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1, 
                  p: 1.5, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <FaMapMarkerAlt style={{ marginRight: 12, color: 'rgba(0, 0, 0, 0.6)', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Venue</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {event.venueName || 'Venue information not available'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3, 
                  p: 1.5, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <FaUser style={{ marginRight: 12, color: 'rgba(0, 0, 0, 0.6)', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Organizer</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {event.organizer || 'Event Organizer'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box>
                <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Price per ticket</Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ${typeof event.basePrice === 'number' ? event.basePrice.toFixed(2) : '0.00'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Availability</Typography>
                      <Typography variant="h6" fontWeight="medium">
                        {event.availableSeats} seats
                      </Typography>
                    </Box>
                  </Box>
                </Card>
                
                <Button 
                  variant="contained" 
                  size="large" 
                  fullWidth 
                  onClick={handleBuyTickets}
                  disabled={!event.published || event.availableSeats <= 0}
                  startIcon={<FaTicketAlt />}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {!event.published ? 'Not Available' : 
                   event.availableSeats > 0 ? 'Buy Tickets' : 'Sold Out'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
          About This Event
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          {event.description}
        </Typography>
      </Paper>
      
      {/* Buy Ticket Dialog - Enhanced */}
      <Dialog 
        open={openBuyDialog} 
        onClose={handleCloseBuyDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {/* Don't nest Typography with heading variant inside DialogTitle */}
          <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
            Purchase Tickets
          </span>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Box sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText', 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <FaTicketAlt />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {event.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {formatDate(event.eventDate)} at {new Date(event.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Typography>
              </Box>
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="ticket-quantity-label">Quantity</InputLabel>
              <Select
                labelId="ticket-quantity-label"
                value={ticketQuantity}
                label="Quantity"
                onChange={(e) => setTicketQuantity(Number(e.target.value))}
              >
                {[...Array(Math.min(10, event.availableSeats))].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
            />
            
            <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {ticketQuantity} x Ticket{ticketQuantity > 1 ? 's' : ''}
                </Typography>
                <Typography variant="body2">
                  ${(event.basePrice * ticketQuantity).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                <Typography variant="subtitle2">Total</Typography>
                <Typography variant="subtitle2">
                  ${(event.basePrice * ticketQuantity).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCloseBuyDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePurchaseTickets} 
            variant="contained" 
            disabled={purchaseLoading}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            {purchaseLoading ? <CircularProgress size={24} /> : 'Complete Purchase'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}