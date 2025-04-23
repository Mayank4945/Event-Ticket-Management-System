"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, UserRole } from "@/types"

export interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  register: async () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Check for existing session on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have user data in localStorage
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])
  
  // Login function - for demo will check against data seeder credentials
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // For demo purposes, we'll simulate authentication with the data seeder credentials
      if (password !== "password") {
        return false
      }
      
      let userData: User | null = null
      
      if (email === "admin@example.com") {
        userData = {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: UserRole.ADMIN,
          status: "ACTIVE"
        }
      } else if (email === "organizer@example.com") {
        userData = {
          id: "2",
          name: "Event Organizer",
          email: "organizer@example.com",
          role: UserRole.ORGANIZER,
          status: "ACTIVE"
        }
      } else if (email === "customer@example.com") {
        userData = {
          id: "3",
          name: "John Customer",
          email: "customer@example.com",
          role: UserRole.CUSTOMER,
          status: "ACTIVE"
        }
      }
      
      if (userData) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)
        return true
      }
      
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }
  
  // Logout function
  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }
  
  // Register function (in real app, would call API)
  const register = async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    try {
      // In a real app, you would make an API call to register the user
      // For demo, we'll just simulate a successful registration
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)