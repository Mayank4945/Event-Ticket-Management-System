"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TicketIcon, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Layers,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import axios from "axios"
import { toast } from "@/components/ui/use-toast"

// Dashboard metrics interface
interface DashboardMetrics {
  userCount?: number
  eventCount?: number
  ticketCount?: number
  revenue?: number
  userGrowth?: number
  eventGrowth?: number
  ticketGrowth?: number
  revenueGrowth?: number
  topEvents?: {
    id?: string
    title?: string
    ticketsSold?: number
    revenue?: number
  }[]
  recentUsers?: {
    id?: string
    name?: string
    email?: string
    activity?: string
    timestamp?: string
  }[]
  upcomingEvents?: {
    id?: string
    title?: string
    date?: string
  }[]
  usersByRole?: {
    customers?: number
    organizers?: number
    admins?: number
    newUsers?: number
  }
  eventPerformance?: {
    id?: string
    title?: string
    date?: string
  }[]
  attendeeCount?: number
  error?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({})
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!loading && (!isAuthenticated || 
      (user?.role !== UserRole.ADMIN && user?.role !== UserRole.ORGANIZER))) {
      router.push("/")
    }
  }, [loading, isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && (user?.role === UserRole.ADMIN || user?.role === UserRole.ORGANIZER)) {
      fetchDashboardMetrics()
    }
  }, [isAuthenticated, user])

  const fetchDashboardMetrics = async () => {
    try {
      setMetricsLoading(true);
      
      let response;
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      
      if (user?.role === UserRole.ADMIN) {
        console.log("Fetching admin dashboard metrics...");
        response = await axios.get(`${apiBaseUrl}/api/dashboard/metrics`, {
          timeout: 30000,
        });
      } else {
        console.log(`Fetching organizer dashboard metrics for ID: ${user?.id}`);
        response = await axios.get(`${apiBaseUrl}/api/dashboard/metrics/organizer/${user?.id}`, {
          timeout: 30000,
        });
      }
      
      console.log("Dashboard API response status:", response.status);
      console.log("Dashboard data:", response.data);
      
      // Check for errors in the response data
      if (response.data && response.data.error) {
        console.error("Server reported error:", response.data.error, response.data.message);
        toast({
          title: "Dashboard Error",
          description: response.data.message || response.data.error,
          variant: "destructive",
        });
        // Continue processing the data anyway since we have fallback values
      }
      
      // Process the data with fallbacks for every field
      const safeData: DashboardMetrics = {
        userCount: response.data.userCount || 0,
        eventCount: response.data.eventCount || 0,
        ticketCount: response.data.ticketCount || 0,
        revenue: response.data.revenue || 0,
        userGrowth: response.data.userGrowth || 0,
        eventGrowth: response.data.eventGrowth || 0,
        ticketGrowth: response.data.ticketGrowth || 0,
        revenueGrowth: response.data.revenueGrowth || 0,
        topEvents: response.data.topEvents || [],
        recentUsers: response.data.recentUsers || [],
        upcomingEvents: response.data.upcomingEvents || [],
        usersByRole: response.data.usersByRole || {
          customers: 0,
          organizers: 0,
          admins: 0,
          newUsers: 0
        },
        eventPerformance: response.data.eventPerformance || [],
        attendeeCount: response.data.attendeeCount || 0
      };
      
      setDashboardMetrics(safeData);
      setError(null);
    } catch (err: any) {
      console.error("Dashboard error details:", err);
      
      // Create a more detailed error message with debugging info
      let errorMessage = "Failed to load dashboard metrics";
      let detailedError = "";
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = "Connection timed out. Server may be overloaded.";
        } else if (err.response) {
          // More detailed error reporting
          errorMessage = `Server error (${err.response.status})`;
          detailedError = err.response.data?.message || err.response.data?.error || "Internal Server Error";
        } else if (err.request) {
          errorMessage = "No response received from server. Backend may be down.";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error(`Dashboard error: ${errorMessage}`, detailedError);
      setError(`${errorMessage}${detailedError ? `: ${detailedError}` : ''}`);
      
      toast({
        title: "Dashboard Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Set fallback data
      setDashboardMetrics({
        userCount: 0,
        eventCount: 0,
        ticketCount: 0,
        revenue: 0,
        userGrowth: 0,
        eventGrowth: 0,
        ticketGrowth: 0,
        revenueGrowth: 0,
        topEvents: [],
        recentUsers: [],
        upcomingEvents: [],
        usersByRole: {
          customers: 0,
          organizers: 0,
          admins: 0,
          newUsers: 0
        },
        eventPerformance: [],
        attendeeCount: 0
      });
    } finally {
      setMetricsLoading(false);
    }
  }
  
  if (loading || metricsLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }
  
  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[80vh] flex-col gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl w-full text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-700 mb-2">Dashboard Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="text-sm text-gray-500 mb-4">
              This could be due to a server issue or missing data. Technical details have been logged.
            </div>
            <Button onClick={fetchDashboardMetrics} className="mx-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </>
    )
  }
  
  if (!isAuthenticated || (user?.role !== UserRole.ADMIN && user?.role !== UserRole.ORGANIZER)) {
    return null
  }
  
  const isAdmin = user.role === UserRole.ADMIN
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{isAdmin ? "Admin Dashboard" : "Organizer Dashboard"}</h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin 
                ? "System overview and management tools" 
                : "Manage your events and track performance"}
            </p>
          </div>
          <Button onClick={fetchDashboardMetrics} disabled={metricsLoading}>
            {metricsLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent rounded-full" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title={isAdmin ? "Total Users" : "Total Attendees"} 
            value={isAdmin ? (dashboardMetrics?.userCount?.toString() || '0') : (dashboardMetrics?.attendeeCount?.toString() || '0')}
            trend={isAdmin ? `${dashboardMetrics?.userGrowth || 0}%` : 'N/A'}
            trendUp={isAdmin ? (dashboardMetrics?.userGrowth || 0) > 0 : false}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard 
            title="Events" 
            value={dashboardMetrics?.eventCount?.toString() || '0'}
            trend={isAdmin ? `${dashboardMetrics?.eventGrowth || 0}%` : 'N/A'}
            trendUp={isAdmin ? (dashboardMetrics?.eventGrowth || 0) > 0 : false}
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatCard 
            title="Tickets Sold" 
            value={dashboardMetrics?.ticketCount?.toString() || '0'}
            trend={isAdmin ? `${dashboardMetrics?.ticketGrowth || 0}%` : 'N/A'}
            trendUp={isAdmin ? (dashboardMetrics?.ticketGrowth || 0) > 0 : false}
            icon={<TicketIcon className="h-5 w-5" />}
          />
          <StatCard 
            title="Revenue" 
            value={`$${(dashboardMetrics?.revenue || 0).toLocaleString()}`}
            trend={isAdmin ? `${dashboardMetrics?.revenueGrowth || 0}%` : 'N/A'}
            trendUp={isAdmin ? (dashboardMetrics?.revenueGrowth || 0) > 0 : false}
            icon={<CreditCard className="h-5 w-5" />}
          />
        </div>
        
        {isAdmin ? 
          <AdminDashboardContent metrics={dashboardMetrics} /> : 
          <OrganizerDashboardContent metrics={dashboardMetrics} />
        }
      </main>
    </div>
  )
}

function AdminDashboardContent({ metrics }: { metrics: DashboardMetrics }) {
  // Make sure metrics is properly initialized
  const safeMetrics = metrics || {};
  const topEvents = safeMetrics.topEvents || [];
  
  return (
    <Tabs defaultValue="sales">
      <TabsList className="mb-6">
        <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
        <TabsTrigger value="users">User Management</TabsTrigger>
        <TabsTrigger value="events">Event Management</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      
      <TabsContent value="sales">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Monthly ticket sales and revenue</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <BarChart3 className="h-48 w-48 text-muted-foreground opacity-50" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Events</CardTitle>
              <CardDescription>Based on ticket sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topEvents && topEvents.length > 0 ? topEvents.map((event, index) => (
                  <div key={event?.id || index} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{event?.title || 'Unnamed Event'}</p>
                        <p className="text-xs text-muted-foreground">{event?.ticketsSold || 0} tickets</p>
                      </div>
                    </div>
                    <p className="font-semibold">${(event?.revenue || 0).toFixed(2)}</p>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground py-4">
                    No event data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage users</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">User management features coming soon</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="events">
        <Card>
          <CardHeader>
            <CardTitle>Event Management</CardTitle>
            <CardDescription>View and manage events</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <Button onClick={() => window.location.href = "/events"}>Go to Events</Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Download reports and analytics</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Reporting features coming soon</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function OrganizerDashboardContent({ metrics }: { metrics: DashboardMetrics }) {
  // Make sure metrics is properly initialized
  const safeMetrics = metrics || {};
  const eventPerformance = safeMetrics.eventPerformance || [];
  
  return (
    <Tabs defaultValue="events">
      <TabsList className="mb-6">
        <TabsTrigger value="events">My Events</TabsTrigger>
        <TabsTrigger value="sales">Ticket Sales</TabsTrigger>
        <TabsTrigger value="attendees">Attendees</TabsTrigger>
      </TabsList>
      
      <TabsContent value="events">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>My Events</CardTitle>
                <CardDescription>Manage your events</CardDescription>
              </div>
              <Button onClick={() => window.location.href = "/events/create"}>Create New Event</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventPerformance && eventPerformance.length > 0 ? eventPerformance.map(event => (
                  <div key={event?.id || Math.random()} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-md bg-muted/60 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{event?.title || 'Unnamed Event'}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {event?.date ? new Date(event.date).toLocaleDateString() : 'No date'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-auto">
                      <Button variant="outline" size="sm" onClick={() => window.location.href = `/events/${event?.id}/edit`}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => window.location.href = `/events/${event?.id}/tickets`}>Manage Tickets</Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No events found. Create your first event to get started!
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = "/events"}>View All Events</Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="sales">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Sales</CardTitle>
            <CardDescription>Overview of your ticket sales</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Sales data will be displayed here</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="attendees">
        <Card>
          <CardHeader>
            <CardTitle>Attendees</CardTitle>
            <CardDescription>Manage event attendees</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Attendee data will be displayed here</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function StatCard({ title, value, trend, trendUp, icon }: { 
  title: string, 
  value: string, 
  trend: string, 
  trendUp: boolean, 
  icon: React.ReactNode 
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs flex items-center ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
          {trend} from last month
        </p>
      </CardContent>
    </Card>
  )
}