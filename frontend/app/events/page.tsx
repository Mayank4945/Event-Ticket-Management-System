"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { PlusCircle, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/types"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"

interface EventCatalogProps {
  searchQuery: string;
}

export function EventCatalog({ searchQuery }: EventCatalogProps) {
  // Use the searchQuery prop as needed
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