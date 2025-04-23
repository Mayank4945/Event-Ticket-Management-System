"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { PlusCircle, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Venue } from "@/types"

export default function VenuesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  const canCreateVenue = isAuthenticated && user?.role === UserRole.ADMIN
  
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        // In a real app, this would be an API call
        // For demo, we'll use sample data
        const sampleVenues: Venue[] = [
          {
            id: '1',
            name: 'City Concert Hall',
            capacity: 2000,
            description: 'A prestigious concert hall in the heart of the city',
            imageUrl: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34',
            address: {
              street: '123 Main Street',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA'
            }
          },
          {
            id: '2',
            name: 'Sports Arena',
            capacity: 15000,
            description: "The city's largest sports and events venue",
            imageUrl: 'https://images.unsplash.com/photo-1584982049388-939fa327e5ed',
            address: {
              street: '456 Stadium Way',
              city: 'New York',
              state: 'NY',
              zipCode: '10002',
              country: 'USA'
            }
          },
          {
            id: '3',
            name: 'Riverside Theater',
            capacity: 800,
            description: 'An intimate theater venue with stunning river views',
            imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35',
            address: {
              street: '789 River Road',
              city: 'New York',
              state: 'NY',
              zipCode: '10003',
              country: 'USA'
            }
          },
          {
            id: '4',
            name: 'Downtown Exhibition Center',
            capacity: 5000,
            description: 'Modern exhibition space for conferences and trade shows',
            imageUrl: 'https://images.unsplash.com/photo-1607004468138-e7e23ea26947',
            address: {
              street: '101 Exhibition Blvd',
              city: 'New York',
              state: 'NY',
              zipCode: '10004',
              country: 'USA'
            }
          }
        ]
        
        setVenues(sampleVenues)
      } catch (error) {
        console.error("Error fetching venues:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVenues()
  }, [])
  
  const filteredVenues = venues.filter(venue => 
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.address.city.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Venues</h1>
            <p className="text-muted-foreground mt-1">Explore our partner venues for upcoming events</p>
          </div>
          
          <div className="flex gap-3">
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Search venues..."
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
            
            {canCreateVenue && (
              <Button onClick={() => router.push("/venues/create")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Venue
              </Button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map(venue => (
              <Card key={venue.id} className="overflow-hidden">
                <div className="aspect-video w-full relative overflow-hidden">
                  <img
                    src={venue.imageUrl || "https://via.placeholder.com/400x200?text=Venue"}
                    alt={venue.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {venue.name}
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {venue.address.city}, {venue.address.state}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{venue.description}</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Capacity:</span> {venue.capacity.toLocaleString()} seats
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/venues/${venue.id}`)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {filteredVenues.length === 0 && (
              <div className="col-span-full text-center py-12">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-medium">No venues found</h3>
                <p className="text-muted-foreground">Try a different search term</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}