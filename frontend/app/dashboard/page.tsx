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
  Layers
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && (!isAuthenticated || 
      (user?.role !== UserRole.ADMIN && user?.role !== UserRole.ORGANIZER))) {
      router.push("/")
    }
  }, [loading, isAuthenticated, user, router])
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }
  
  // If not authorized, don't render anything
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title={isAdmin ? "Total Users" : "Total Attendees"} 
            value={isAdmin ? "3,852" : "1,248"}
            trend="+12%"
            trendUp={true}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard 
            title="Events" 
            value={isAdmin ? "128" : "8"}
            trend={isAdmin ? "+8%" : "+2"}
            trendUp={true}
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatCard 
            title="Tickets Sold" 
            value={isAdmin ? "15,620" : "1,625"}
            trend={isAdmin ? "+23%" : "+18%"}
            trendUp={true}
            icon={<TicketIcon className="h-5 w-5" />}
          />
          <StatCard 
            title="Revenue" 
            value={isAdmin ? "$256,841" : "$38,475"}
            trend={isAdmin ? "+15%" : "+22%"}
            trendUp={true}
            icon={<CreditCard className="h-5 w-5" />}
          />
        </div>
        
        {isAdmin ? <AdminDashboardContent /> : <OrganizerDashboardContent />}
      </main>
    </div>
  )
}

function AdminDashboardContent() {
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
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Summer Music Festival</p>
                    <p className="text-sm text-muted-foreground">1,258 tickets</p>
                  </div>
                  <p className="text-green-600 font-medium">$94,350</p>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Tech Conference 2025</p>
                    <p className="text-sm text-muted-foreground">524 tickets</p>
                  </div>
                  <p className="text-green-600 font-medium">$52,400</p>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Broadway Show</p>
                    <p className="text-sm text-muted-foreground">486 tickets</p>
                  </div>
                  <p className="text-green-600 font-medium">$36,450</p>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Food Festival</p>
                    <p className="text-sm text-muted-foreground">342 tickets</p>
                  </div>
                  <p className="text-green-600 font-medium">$17,100</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Events</Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="users">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent User Activity</CardTitle>
              <CardDescription>New registrations and logins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">JD</span>
                    </div>
                    <div>
                      <p className="font-medium">Jane Doe</p>
                      <p className="text-xs text-muted-foreground">jane.doe@example.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">New Registration</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">MS</span>
                    </div>
                    <div>
                      <p className="font-medium">Mike Smith</p>
                      <p className="text-xs text-muted-foreground">mike.smith@example.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Purchased Tickets</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">AJ</span>
                    </div>
                    <div>
                      <p className="font-medium">Alex Johnson</p>
                      <p className="text-xs text-muted-foreground">alex.j@example.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Account Updated</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Users</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
              <CardDescription>Distribution by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">3,624</p>
                    <p className="text-sm text-muted-foreground">Customers</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">156</p>
                    <p className="text-sm text-muted-foreground">Organizers</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">72</p>
                    <p className="text-sm text-muted-foreground">Admins</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">248</p>
                    <p className="text-sm text-muted-foreground">New (30d)</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Manage Users</Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="events">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Summer Music Festival</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      May 15, 2025
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Tech Conference 2025</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      June 20, 2025
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Broadway Show</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      May 5, 2025
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Add New Event</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Event Categories</CardTitle>
              <CardDescription>Distribution by type</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <Layers className="h-32 w-32 text-muted-foreground opacity-50" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Details</Button>
              <Button variant="outline">Download Report</Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="reports">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Download or view reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">Monthly Sales Report</p>
                    <p className="text-xs text-muted-foreground">Last updated: April 15, 2025</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">User Growth Analysis</p>
                    <p className="text-xs text-muted-foreground">Last updated: April 10, 2025</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">Event Performance Metrics</p>
                    <p className="text-xs text-muted-foreground">Last updated: April 8, 2025</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">Financial Summary Q1 2025</p>
                    <p className="text-xs text-muted-foreground">Last updated: April 1, 2025</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Generate Custom Report</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>Platform performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">Average Page Load Time</p>
                    <p className="text-sm text-muted-foreground">Across all pages</p>
                  </div>
                  <p className="font-medium">1.2s</p>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">API Response Time</p>
                    <p className="text-sm text-muted-foreground">Average</p>
                  </div>
                  <p className="font-medium">245ms</p>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">Error Rate</p>
                    <p className="text-sm text-muted-foreground">Last 24 hours</p>
                  </div>
                  <p className="font-medium">0.05%</p>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">Uptime</p>
                    <p className="text-sm text-muted-foreground">Last 30 days</p>
                  </div>
                  <p className="font-medium">99.98%</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View System Logs</Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

function OrganizerDashboardContent() {
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
              <Button>Create New Event</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-md bg-muted/60 flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">Summer Music Festival</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        May 15, 2025
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Manage Tickets</Button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-md bg-muted/60 flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">Indie Film Showcase</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        June 10, 2025
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Manage Tickets</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Events</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Event Performance</CardTitle>
              <CardDescription>Ticket sales by event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Summer Music Festival</span>
                    <span className="text-sm">625/1000</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '62.5%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Indie Film Showcase</span>
                    <span className="text-sm">142/300</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '47.3%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Analytics</Button>
              <Button variant="outline">Export Data</Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="sales">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Ticket Sales Overview</CardTitle>
              <CardDescription>Sales trend for your events</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <TrendingUp className="h-48 w-48 text-muted-foreground opacity-50" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Details</Button>
              <Button variant="outline">Download Report</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sales by Ticket Type</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">480</p>
                    <p className="text-sm text-muted-foreground">Standard</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">95</p>
                    <p className="text-sm text-muted-foreground">VIP</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">142</p>
                    <p className="text-sm text-muted-foreground">Early Bird</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">50</p>
                    <p className="text-sm text-muted-foreground">Premium</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Manage Ticket Types</Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="attendees">
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendees</CardTitle>
              <CardDescription>People registered for your events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">JD</span>
                    </div>
                    <div>
                      <p className="font-medium">Jane Doe</p>
                      <p className="text-xs text-muted-foreground">jane.doe@example.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Summer Music Festival</p>
                    <p className="text-xs text-muted-foreground">VIP Ticket</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">MS</span>
                    </div>
                    <div>
                      <p className="font-medium">Mike Smith</p>
                      <p className="text-xs text-muted-foreground">mike.smith@example.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Summer Music Festival</p>
                    <p className="text-xs text-muted-foreground">Standard Ticket</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">AJ</span>
                    </div>
                    <div>
                      <p className="font-medium">Alex Johnson</p>
                      <p className="text-xs text-muted-foreground">alex.j@example.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Indie Film Showcase</p>
                    <p className="text-xs text-muted-foreground">Early Bird Ticket</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">SL</span>
                    </div>
                    <div>
                      <p className="font-medium">Sarah Lee</p>
                      <p className="text-xs text-muted-foreground">sarah.lee@example.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Summer Music Festival</p>
                    <p className="text-xs text-muted-foreground">Premium Ticket</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Send Message</Button>
              <Button variant="outline">Export List</Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
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