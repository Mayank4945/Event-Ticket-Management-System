"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EventCatalog } from "../components/event-catalog"
import { MyTickets } from "@/components/my-tickets"
import { UserManagement } from "../components/user-management"
import { EventManagement } from "../components/event-management"
import { Dashboard } from "../components/dashboard"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Loader2 } from "lucide-react"
import { UserRole } from "@/types"

export default function Home() {
  const [activeTab, setActiveTab] = useState("browse")
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  
  // Set the page title
  useEffect(() => {
    document.title = "Event Ticket Management System"
  }, [])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {isAuthenticated ? `Welcome, ${user?.name}` : "Welcome to Event Ticket System"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAuthenticated 
              ? "Manage your tickets and browse upcoming events" 
              : "Find and book tickets for the best events in your area"}
          </p>
        </div>

        <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="browse">Browse Events</TabsTrigger>
            {isAuthenticated && <TabsTrigger value="tickets">My Tickets</TabsTrigger>}
            {isAuthenticated && user?.role === UserRole.ADMIN && (
              <TabsTrigger value="users">Manage Users</TabsTrigger>
            )}
            {isAuthenticated && (user?.role === UserRole.ADMIN || user?.role === UserRole.ORGANIZER) && (
              <TabsTrigger value="events">Manage Events</TabsTrigger>
            )}
            {isAuthenticated && user?.role === UserRole.ADMIN && (
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="browse">
            <EventCatalog />
          </TabsContent>

          {isAuthenticated && (
            <TabsContent value="tickets">
              <MyTickets />
            </TabsContent>
          )}

          {isAuthenticated && user?.role === UserRole.ADMIN && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}

          {isAuthenticated && (user?.role === UserRole.ADMIN || user?.role === UserRole.ORGANIZER) && (
            <TabsContent value="events">
              <EventManagement />
            </TabsContent>
          )}

          {isAuthenticated && user?.role === UserRole.ADMIN && (
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
          )}
        </Tabs>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Event Ticket Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}