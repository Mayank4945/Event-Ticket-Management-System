"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Ticket, LogOut, Menu, User, LogIn, UserPlus, Calendar, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserRole } from "@/types"

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">EventTicket</span>
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-foreground hover:text-foreground/80">
            Home
          </Link>
          <Link href="/events" className="text-foreground hover:text-foreground/80">
            Events
          </Link>
          <Link href="/venues" className="text-foreground hover:text-foreground/80">
            Venues
          </Link>
          {isAuthenticated && (
            <Link href="/my-tickets" className="text-foreground hover:text-foreground/80">
              My Tickets
            </Link>
          )}
          
          {isAuthenticated && (user?.role === UserRole.ADMIN || user?.role === UserRole.ORGANIZER) && (
            <Link href="/dashboard" className="text-foreground hover:text-foreground/80">
              Dashboard
            </Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
                    {user?.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs text-muted-foreground">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/my-tickets">My Tickets</Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={toggleTheme} className="justify-between px-2 cursor-pointer">
                  <span className="flex items-center">
                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={logout} className="justify-start px-2 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={toggleTheme} size="icon" className="mr-2">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Event Ticket System</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Link href="/" className="block py-2 hover:text-primary">
                  Home
                </Link>
                <Link href="/events" className="block py-2 hover:text-primary">
                  Events
                </Link>
                <Link href="/venues" className="block py-2 hover:text-primary">
                  Venues
                </Link>
                {isAuthenticated && (
                  <>
                    <Link href="/my-tickets" className="block py-2 hover:text-primary">
                      My Tickets
                    </Link>
                    <Link href="/profile" className="block py-2 hover:text-primary">
                      My Profile
                    </Link>
                    {(user?.role === UserRole.ADMIN || user?.role === UserRole.ORGANIZER) && (
                      <Link href="/dashboard" className="block py-2 hover:text-primary">
                        Dashboard
                      </Link>
                    )}
                    <Button variant="outline" onClick={logout} className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                )}
                {!isAuthenticated && (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/auth/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth/signup">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}