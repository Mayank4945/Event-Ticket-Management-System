"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/types"
import { Navbar } from "@/components/navbar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, PlusCircle, Calendar, Loader2 } from "lucide-react"

// Define Event interface
interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  imageUrl?: string;
  categories?: string[];
  ticketPrice: number;
}

interface EventCatalogProps {
  searchQuery: string;
}

export function EventCatalog({ searchQuery }: EventCatalogProps) {
  const router = useRouter() // Add router
  const [events, setEvents] = useState<Event[]>([]) // Add proper typing
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        let url = 'http://localhost:8080/api/events'
        
        // Add search query if provided
        if (searchQuery) {
          url = `http://localhost:8080/api/events/search?title=${encodeURIComponent(searchQuery)}`
        }
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        
        const data = await response.json()
        setEvents(data)
      } catch (err) {
        console.error('Error fetching events:', err)
        setError('Failed to load events. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvents()
  }, [searchQuery])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }
  
  if (events.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground mb-4">
          {searchQuery ? 'No events found matching your search.' : 'No events available at the moment.'}
        </p>
      </div>
    )
  }
  
  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date not available";
      }
      return date.toLocaleDateString();
    } catch (error) {
      return "Date not available";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
      return "";
    }
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden flex flex-col">
          <div className="aspect-video relative overflow-hidden">
            {event.imageUrl ? (
              <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Calendar className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <CardDescription>
              {formatDate(event.eventDate)} {formatTime(event.eventDate) && `at ${formatTime(event.eventDate)}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <Badge variant="outline">
                {event.categories && event.categories.length > 0 ? event.categories[0] : 'Event'}
              </Badge>
              <p className="font-medium">${event.ticketPrice?.toFixed(2) || '0.00'}</p>
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <Button 
              className="w-full" 
              onClick={() => router.push(`/events/${event.id}`)}
            >
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default function EventsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const canCreateEvent = isAuthenticated && (user?.role === UserRole.ADMIN || user?.role === UserRole.ORGANIZER)
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Upcoming Events</h1>
            <p className="text-muted-foreground mt-1">Discover and book tickets for amazing events</p>
          </div>
          
          <div className="flex gap-3">
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Events</SheetTitle>
                  <SheetDescription>
                    Refine your event search
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  <Accordion type="single" collapsible defaultValue="category">
                    <AccordionItem value="category">
                      <AccordionTrigger>Categories</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="music" />
                          <Label htmlFor="music">Music</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="sports" />
                          <Label htmlFor="sports">Sports</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="theater" />
                          <Label htmlFor="theater">Theater</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="comedy" />
                          <Label htmlFor="comedy">Comedy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="conference" />
                          <Label htmlFor="conference">Conference</Label>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="date">
                      <AccordionTrigger>Date Range</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="date-from">From</Label>
                          <Input type="date" id="date-from" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date-to">To</Label>
                          <Input type="date" id="date-to" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="price">
                      <AccordionTrigger>Price Range</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor="price-min">Min ($)</Label>
                            <Input type="number" id="price-min" min="0" placeholder="0" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label htmlFor="price-max">Max ($)</Label>
                            <Input type="number" id="price-max" min="0" placeholder="1000" />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                
                <SheetFooter>
                  <SheetClose asChild>
                    <Button className="w-full">Apply Filters</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            
            {canCreateEvent && (
              <Button onClick={() => router.push("/events/create")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            )}
          </div>
        </div>
        
        <EventCatalog searchQuery={searchQuery} />
      </main>
    </div>
  )
}