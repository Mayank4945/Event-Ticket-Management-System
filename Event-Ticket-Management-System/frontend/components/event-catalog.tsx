"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, Clock } from "lucide-react"
import { format } from "date-fns"
import axios from "axios"

export interface Event {
  id: string
  title: string
  description: string
  imageUrl?: string
  categories: string[]
  eventDate: string
  endDate: string
  basePrice: number
  availableSeats: number
  venueName?: string // Added venueName property
}

export function EventCatalog() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:8080/api/events")
        
        // Debug logs to inspect raw event data
        console.log("Raw events data:", response.data)
        if (response.data.length > 0) {
          console.log("First event price (before parsing):", 
            response.data[0].basePrice, 
            "Type:", typeof response.data[0].basePrice)
        }

        // Process the data to ensure prices are properly parsed as numbers
        const processedEvents = response.data.map((event: {
          id: string
          title: string
          description: string
          imageUrl?: string
          categories: string[]
          eventDate: string
          endDate: string
          basePrice: string | number
          availableSeats: number
          venueName?: string
        }): Event => {
          const parsedPrice = parseFloat(event.basePrice as string) || 0
          console.log(`Event ${event.id || 'unknown'}: ${event.title} - Raw price: ${event.basePrice} (${typeof event.basePrice}) → Parsed: ${parsedPrice}`)
          return {
            ...event,
            basePrice: parsedPrice
          }
        })

        // Make sure to set the state with the processed events
        setEvents(processedEvents)
      } catch (error) {
        console.error("Failed to fetch events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-10">Loading events...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="aspect-video w-full relative overflow-hidden">
              <img
                src={event.imageUrl || "https://via.placeholder.com/400x200?text=Event"}
                alt={event.title}
                className="object-cover w-full h-full"
              />
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">{event.title}</CardTitle>
              <CardDescription>{event.categories.join(", ")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 opacity-70" />
                  <span>
                    {new Date(event.eventDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 opacity-70" />
                  <span>{event.venueName || "Venue information not available"}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 opacity-70" />
                  <span>{format(new Date(event.eventDate), "h:mm a")}</span>
                </div>
                <div className="mt-2">
                  <span className="font-medium text-base">${event.basePrice.toFixed(2)}</span>
                  <span className="text-muted-foreground ml-2">
                    {event.availableSeats} seats left
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => router.push(`/events/${event.id}`)}
                className="w-full"
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-10">
            No events found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}