"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/types"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "@/components/ui/use-toast"

// Form validation schema
const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  eventDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date",
  }),
  venueId: z.string().min(1, "Please select a venue"),
  totalSeats: z.coerce.number().int().positive("Total seats must be a positive number"),
  ticketPrice: z.coerce.number().positive("Ticket price must be a positive number"),
  categories: z.string().min(1, "Please select at least one category"),
  imageUrl: z.string().url("Please enter a valid image URL").optional(),
})

export default function CreateEventPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [venues, setVenues] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      venueId: "",
      totalSeats: 100,
      ticketPrice: 0,
      categories: "",
      imageUrl: "",
    },
  })

  // Fetch venues for the dropdown
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/venues")
        if (response.ok) {
          const data = await response.json()
          setVenues(data)
        }
      } catch (error) {
        console.error("Error fetching venues:", error)
      }
    }
    
    fetchVenues()
  }, [])

  // Check if user is authorized
  useEffect(() => {
    if (!loading && (!isAuthenticated || 
        (user?.role !== UserRole.ADMIN && user?.role !== UserRole.ORGANIZER))) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create events",
        variant: "destructive",
      })
      router.push("/events")
    }
  }, [user, isAuthenticated, loading, router])

  const onSubmit = async (values: z.infer<typeof eventFormSchema>) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create an event",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Prepare the event data
      const eventData = {
        ...values,
        organizerId: user.id,
        published: false,
        availableSeats: values.totalSeats,
        categories: [values.categories], // Convert to array as expected by backend
      }
      
      // Send the request to create the event
      const response = await fetch("http://localhost:8080/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })
      
      if (!response.ok) {
        throw new Error("Failed to create event")
      }
      
      const createdEvent = await response.json()
      
      toast({
        title: "Event Created",
        description: "Your event has been created successfully",
      })
      
      // Redirect to the event details page
      router.push(`/events/${createdEvent.id}`)
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <p>Loading...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
            <CardDescription>
              Fill out the form below to create a new event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your event" 
                          className="min-h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="venueId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a venue" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {venues.map((venue: any) => (
                              <SelectItem key={venue.id} value={venue.id}>
                                {venue.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="totalSeats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Seats</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ticketPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Music">Music</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Theater">Theater</SelectItem>
                          <SelectItem value="Comedy">Comedy</SelectItem>
                          <SelectItem value="Conference">Conference</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a URL to an image for your event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <CardFooter className="px-0 pt-6">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Event"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}