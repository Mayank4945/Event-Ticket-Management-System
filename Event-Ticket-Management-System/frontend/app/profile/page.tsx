"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { UserProfileForm } from "@/components/user-profile-form"
import { MyTickets } from "@/components/my-tickets"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/types"

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    fetchUserData()
  }, [authUser, authLoading, isAuthenticated, router])

  const fetchUserData = async () => {
    if (!authUser?.id) return

    setLoading(true)
    try {
      // Use the user endpoint instead of members endpoint
      const response = await fetch(`http://localhost:8080/api/users/${authUser.id}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch user details")
      }
      
      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error("Error fetching user details:", error)
      // Use the already authenticated user info as fallback
      setUser(authUser)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth or fetching data
  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[70vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>
          
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              {user?.role === UserRole.ORGANIZER && (
                <TabsTrigger value="events">My Events</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    View and update your profile details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user && <UserProfileForm user={user} onUpdate={fetchUserData} />}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tickets">
              <Card>
                <CardHeader>
                  <CardTitle>My Tickets</CardTitle>
                  <CardDescription>
                    View all your purchased tickets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MyTickets />
                </CardContent>
              </Card>
            </TabsContent>
            
            {user?.role === UserRole.ORGANIZER && (
              <TabsContent value="events">
                <Card>
                  <CardHeader>
                    <CardTitle>My Events</CardTitle>
                    <CardDescription>
                      Manage events you've organized
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end mb-6">
                      <Button onClick={() => router.push("/events/create")}>
                        Create New Event
                      </Button>
                    </div>
                    {/* Event list component would go here */}
                    <div className="text-center py-4 text-muted-foreground">
                      You haven't created any events yet.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </>
  )
}