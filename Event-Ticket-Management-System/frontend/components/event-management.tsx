"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Edit, Trash2, Eye, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function EventManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteEventId, setDeleteEventId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    const fetchOrganizerEvents = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/events?organizerId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch your events",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizerEvents()
  }, [user])

  const handleDeleteEvent = async (eventId) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`http://localhost:8080/api/events/${eventId}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventId))
        toast({
          title: "Event Deleted",
          description: "The event has been successfully deleted",
        })
      } else {
        throw new Error("Failed to delete event")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete the event",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteEventId(null)
    }
  }

  const handlePublishEvent = async (eventId) => {
    setIsPublishing(true)
    try {
      const response = await fetch(`http://localhost:8080/api/events/${eventId}/publish`, {
        method: "PUT",
      })
      
      if (response.ok) {
        const updatedEvent = await response.json()
        setEvents(events.map(event => 
          event.id === eventId ? updatedEvent : event
        ))
        toast({
          title: "Event Published",
          description: "Your event is now visible to the public",
        })
      } else {
        throw new Error("Failed to publish event")
      }
    } catch (error) {
      console.error("Error publishing event:", error)
      toast({
        title: "Error",
        description: "Failed to publish the event",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Events</h2>
        <Button onClick={() => router.push("/events/create")}>
          Create New Event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
          <Button onClick={() => router.push("/events/create")}>
            Create Your First Event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              {event.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <Badge variant={event.published ? "default" : "outline"}>
                    {event.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(event.eventDate).toLocaleDateString()} • {event.availableSeats} seats available
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {event.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 border-t p-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/events/edit/${event.id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {!event.published && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handlePublishEvent(event.id)}
                    disabled={isPublishing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setDeleteEventId(event.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event
                        and all associated tickets.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteEvent(deleteEventId)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}