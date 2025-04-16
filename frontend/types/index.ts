export enum BookStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  LOANED = "LOANED",
  LOST = "LOST",
}

export enum ReservationStatus {
  WAITING = "WAITING",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  NONE = "NONE",
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
  CANCELED = "CANCELED",
  BLACKLISTED = "BLACKLISTED",
  NONE = "NONE",
}

export enum TicketType {
  STANDARD = "STANDARD",
  VIP = "VIP",
  PREMIUM = "PREMIUM",
  EARLY_BIRD = "EARLY_BIRD"
}

export enum OrderStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  REFUNDED = "REFUNDED"
}

export enum UserRole {
  ADMIN = "ADMIN",
  ORGANIZER = "ORGANIZER",
  CUSTOMER = "CUSTOMER"
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED"
}

export interface BookItem {
  barcode: string
  isReferenceOnly?: boolean
  borrowed?: boolean
  dueDate?: string
  price?: number
  format?: string
  status: string
  dateOfPurchase?: string
  publicationDate?: string
  rack?: string
}

export interface Book {
  id: string
  isbn: string
  title: string
  subject: string
  publisher: string
  language: string
  numberOfPages: number
  authors: string[]
  publicationDate: string
  bookItems: BookItem[]
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Person {
  name: string
  address?: Address
  email: string
  phone: string
}

export interface Member {
  id: string
  password?: string
  person: Person
  status: AccountStatus
  dateOfMembership: string
  totalBooksCheckedout: number
}

export interface BookReservation {
  id: string
  creationDate: string
  status: ReservationStatus
  bookItemBarcode: string
  memberId: string
}

export interface Fine {
  id: string
  creationDate: string
  amount: number
  bookItemBarcode: string
  memberId: string
  paymentDate?: string
}

export interface User {
  id: string
  name: string
  email: string
  password?: string
  phone: string
  address?: Address
  role: UserRole
  registrationDate: string
  status: UserStatus
}

export interface Venue {
  id: string
  name: string
  address: Address
  capacity: number
  description: string
  imageUrl: string
}

export interface Event {
  id: string
  title: string
  description: string
  eventDate: string
  endDate: string
  venueId: string
  organizerId: string
  imageUrl: string
  categories: string[]
  published: boolean
  totalSeats: number
  availableSeats: number
  basePrice: number
  venue?: Venue
}

export interface Ticket {
  id: string
  eventId: string
  orderId: string
  userId: string
  type: TicketType
  price: number
  ticketNumber: string
  used: boolean
  purchaseDate: string
  event?: Event
}

export interface Order {
  id: string
  userId: string
  ticketIds: string[]
  totalAmount: number
  status: OrderStatus
  orderDate: string
  paymentMethod: string
  transactionId: string
  tickets?: Ticket[]
}

