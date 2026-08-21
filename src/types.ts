export interface Lead {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  clientType: "Residential" | "Commercial";
  budget: number;
  sqft: number;
  timeline: string;
  condition: string;
  status: "New" | "Contacted" | "Qualified" | "Quoted" | "Won" | "Lost";
  score: number;
  justification?: string;
  actionPlan?: string[];
  createdAt: string;
  source: string;
  address?: string;
}

export interface Estimate {
  id: string;
  customerName?: string;
  clientName?: string;
  projectName?: string;
  projectType?: string;
  address: string;
  sqft?: number;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Approved";
  value?: number;
  date?: string;
  createdAt?: string;
  clientPhone?: string;
  clientEmail?: string;
  details?: string;
  laborHours?: number;
  materialCost?: number;
  prepComplexity?: "Low" | "Medium" | "High";
  materialTier?: "Starter" | "Premium" | "Ultra";
  includeTrim?: boolean;
  includeCeiling?: boolean;
  
  // QuoteGenius Module properties
  rooms?: {
    name: string;
    width: string | number;
    length: string | number;
    height: string | number;
    sheen: string;
    wallArea: number;
    gallonsRequired?: number;
  }[];
  materials?: {
    brand: string;
    line: string;
    finish?: string;
    cost?: number;
    gallonCost?: number;
    totalGallons?: number;
  }[];
  totalAmount?: number;
  upSells?: UpSellOption[];
  notes?: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: "Email" | "SMS" | "Direct Mail" | "Google Ads" | "Facebook Ads";
  status: "Active" | "Scheduled" | "Completed" | "Draft";
  sent: number;
  delivered: number;
  opened: number;
  clicks: number;
  leadsGenerated: number;
  spend: number;
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  platform: "Google" | "Yelp" | "Facebook" | "Houzz" | "Angi";
  rating: number;
  content: string;
  date: string;
  replied: boolean;
  replyText?: string;
  replyDate?: string;
  isSpam?: boolean;
  spamReason?: string;
  sentiment?: "Positive" | "Neutral" | "Negative";
  projectType?: string;
  aiSuggestedReply?: string;
}

export interface VideoTestimonial {
  id: string;
  author: string;
  companyName?: string;
  projectCompleted: string;
  rating: number;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  transcript: string;
  date: string;
  approved: boolean;
  embedCode: string;
}

export interface ReviewRequest {
  id: string;
  customerName: string;
  channel: "SMS" | "Email" | "WhatsApp";
  recipient: string;
  sentAt: string;
  status: "Delivered" | "Opened" | "Clicked" | "Review Left";
  reviewLeftRating?: number;
  jobName: string;
}

export interface ReviewWidget {
  id: string;
  name: string;
  type: "Carousel" | "Grid" | "Badge" | "Popup" | "Floating Tab";
  minRatingFilter: number;
  theme: "Dark" | "Light" | "Transparent";
  primaryColor: string;
  embedCode: string;
}

export interface DirectoryListing {
  id: string;
  platform: "Google Business Profile" | "Apple Maps" | "Bing Places" | "Yelp" | "Facebook" | "YellowPages";
  status: "Synced" | "Pending" | "Action Required" | "Disconnected";
  napConsistencyScore: number;
  address: string;
  phone: string;
  website: string;
  reviewsCount: number;
  avgRating: number;
  lastSynced: string;
}

export interface ReputationSettings {
  reviewsAiEnabled: boolean;
  waitTimeMins: number;
  dripMode: boolean;
  aiTone: "Professional & Grateful" | "Warm & Friendly" | "Formal Commercial" | "Casual";
  autoRespondMinRating: number;
  customReviewLink: string;
  smsTemplate: string;
  emailSubject: string;
  emailTemplate: string;
  whatsAppTemplate: string;
  qrCodeUrl: string;
  googleProfileConnected: boolean;
  googleProfileAccount: string;
  facebookConnected: boolean;
}


export interface Project {
  id: string;
  name: string;
  customerName: string;
  address: string;
  crewAssigned: string[];
  status: "Scheduled" | "Active" | "On Hold" | "Completed";
  progress: number;
  contractValue: number;
  margin: number;
  startDate: string;
  endDate?: string;
  photos: { phase: "Before" | "During" | "After"; url: string }[];
  checklist: { id: string; label: string; checked: boolean; photosCount: number; photosRequired: number }[];
}

export interface CrewMember {
  id: string;
  name: string;
  role: "Lead Painter" | "Painter" | "Apprentice" | "Estimator";
  avatar: string;
  skills: string[];
  hoursThisWeek: number;
  productivityScore: number;
  status: "Active" | "Inactive";
}

export interface TimeEntry {
  id: string;
  employeeName: string;
  date: string;
  project: string;
  hours: number;
  status: "Pending" | "Approved" | "Rejected";
  gpsClockIn?: string;
}

export interface Course {
  id: string;
  title: string;
  duration: string;
  completionRate: number;
  thumbnail: string;
  required: boolean;
  quizQuestions: number;
}

export interface Invoice {
  id: string;
  customerName?: string;
  clientName?: string;
  amount: number;
  dueDate: string;
  status: "Current" | "Overdue" | "Paid" | "Draft" | "Sent";
  daysOverdue?: number;
}

export interface Expense {
  id: string;
  description: string;
  category: "Materials" | "Labor" | "Fuel" | "Equipment" | "Marketing" | "Insurance" | "Other";
  amount: number;
  date: string;
  projectAllocated?: string;
  receiptUrl?: string;
}

export interface SOP {
  id: string;
  title: string;
  description: string;
  role: string;
  videoLink?: string;
  checklist: string[];
}

export interface Crew {
  id: string;
  leader: string;
  membersCount: number;
  status: "On-site" | "Dispatched" | "Standby" | string;
}

export interface UpSellOption {
  id: string;
  title: string;
  desc: string;
  price: number;
  selected: boolean;
  category: string;
}

export interface Appointment {
  id: string;
  title: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  serviceId?: string;
  serviceName: string;
  status: "Upcoming" | "Confirmed" | "Pending" | "Completed" | "Cancelled";
  date: string;
  startTime: string;
  endTime: string;
  calendar: "Sales" | "Estimating" | "Crew Dispatch" | "Quality Inspection" | "Executive";
  owner: string;
  roomId?: string;
  roomName?: string;
  equipmentId?: string;
  equipmentName?: string;
  location?: string;
  notes?: string;
  price?: number;
  createdAt: string;
}

export interface ServiceMenuItem {
  id: string;
  title: string;
  category: "Estimating" | "Consultation" | "On-Site" | "Inspection";
  durationMins: number;
  price: number;
  calendar: string;
  description: string;
  requiredEquipment?: string;
  defaultRoom?: string;
  color: string;
}

export interface RoomResource {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: "Available" | "In Use" | "Maintenance";
  description: string;
}

export interface EquipmentResource {
  id: string;
  name: string;
  category: string;
  quantity: number;
  serialNumber?: string;
  status: "Available" | "Assigned" | "Maintenance";
}

export interface CalendarPreference {
  timeZone: string;
  defaultDurationMins: number;
  bufferMins: number;
  autoConfirm: boolean;
  sendSmsReminders: boolean;
  sendEmailReminders: boolean;
  reminderNoticeHours: number;
  allowClientCancellation: boolean;
  cancellationNoticeHours: number;
}

export interface StaffAvailability {
  dayOfWeek: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface CalendarConnection {
  id: string;
  provider: "Google Calendar" | "Outlook" | "Apple iCal" | "Zoom";
  accountEmail: string;
  status: "Connected" | "Syncing" | "Disconnected";
  lastSynced: string;
  twoWaySync: boolean;
}

export interface SmartListOption {
  id: string;
  name: string;
  description: string;
  filters: {
    status?: string;
    calendar?: string;
    search?: string;
    owner?: string;
    dateRange?: string;
  };
}

