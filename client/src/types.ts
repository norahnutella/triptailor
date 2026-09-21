/**
 * TRIPTAILOR DATA MODELS
 * ----------------------------------------------------
 * These TypeScript interfaces define the core data contracts
 * for the application.
 */

// Active view in the application
export type ViewScreen = 'dashboard' | 'create' | 'itinerary' | 'profile' | 'contact';

export interface TripMember { id: string; name: string; email: string; avatar: string; role?: string; }

// A single planned activity or waypoint in an itinerary
export interface ActivityItem {
  id: string;
  orderNumber: number;
  time: string;
  duration: string;
  title: string;
  type: 'visit' | 'beach' | 'dining' | 'activity' | 'drive';
  categoryTag?: string;
  isTopPick?: boolean;
  description: string;
  costInfo: string;
  rating: number;
  reviewCount: string;
  highlightNote: string;
  tags: string[];
  image: string;
  status?: 'confirmed' | 'booked' | 'hold' | 'pending';
  transitAfter?: {
    duration: string;
    distance: string;
    label: string;
  };
}

// Grouping of activities for a single day
export interface DayItinerary {
  dayNumber: number;
  dateStr: string;
  title: string;
  activities: ActivityItem[];
}

// Co-traveler profile and live collaborative presence
export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  status: 'VIEWING' | 'EDITING' | 'VOTING' | 'IDLE';
  currentAction: string;
  color: string;
}

// Pod chat note
export interface PodMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

// Multi-member collaborative group message
export interface GroupMessage {
  id: string;
  tripId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  text: string;
  timestamp: number;
  timeFormatted: string;
  readBy: string[];
  tag?: 'itinerary' | 'dining' | 'general' | 'urgent';
}

// Overall trip specification
export interface TripData {
  id: string;
  members?: TripMember[];
  title: string;
  destination: string;
  dates: string;
  daysCount: number;
  travelersCount: number;
  budgetTotal: number;
  budgetPerPerson: number;
  budgetTier: 'Budget' | 'Moderate' | 'Premium' | 'Luxury';
  tags: string[];
  days: DayItinerary[];
}

/**
 * A persisted itinerary belonging to one authenticated user.
 *
 * It extends TripData so the complete day-by-day itinerary is
 * preserved when a trip is saved. The timestamps allow the UI
 * to distinguish the original save from later updates.
 */
export interface TripSummary { id: string; title: string; destination?: string; members: TripMember[]; owner: TripMember; updatedAt?: string; }

export interface TripChatAttachment {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface TripPollOption {
  text: string;
  votes: number;
}

export interface TripChatPoll {
  question: string;
  options: TripPollOption[];
  votedOptionIndex?: number | null;
}

export interface TripChatMessage {
  id: string;
  text?: string;
  createdAt: string;
  sender: TripMember;
  kind: 'text' | 'file' | 'poll';
  attachment?: TripChatAttachment;
  poll?: TripChatPoll;
}

export interface SavedItinerary extends TripData {
  userId: string;
  savedAt: string;
  updatedAt: string;
}

// User Profile for Authentication & Account Settings
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  bio?: string;
  joinedDate?: string;
  tripsCount: number;
  savedPlacesCount: number;
  currency: string;
  travelPace: 'Relaxed' | 'Balanced' | 'Packed';
  preferredCuisines?: string[];
  isGuest?: boolean;
}

// In-app notifications
export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'vote' | 'invite' | 'comment' | 'alert' | 'system';
}
