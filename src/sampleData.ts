import { Lead, Estimate, Campaign, Review, Project, CrewMember, TimeEntry, Course, Invoice, Expense, SOP, Crew } from "./types";

export const initialLeads: Lead[] = [
  {
    id: "lead-1",
    clientName: "Sarah Williams",
    phone: "(717) 555-0142",
    email: "sarah.williams@outlook.com",
    clientType: "Residential",
    budget: 4500,
    sqft: 1800,
    timeline: "Next 2 weeks",
    condition: "Good condition, needs standard prep",
    status: "New",
    score: 85,
    source: "Google Ads",
    address: "124 Hillside Dr, York, PA",
    createdAt: "2026-06-25",
    justification: "High score due to immediate timeline, healthy budget-to-sqft ratio, and standard surface conditions which will allow high margins.",
    actionPlan: [
      "Contact Sarah within 15 minutes of submission",
      "Propose on-site measurement and premium SW Duration coating tier",
      "Highlight multi-year satisfaction guarantee"
    ]
  },
  {
    id: "lead-2",
    clientName: "Bob Martinez",
    phone: "(717) 555-0189",
    email: "bmartinez@gmail.com",
    clientType: "Residential",
    budget: 8200,
    sqft: 3200,
    timeline: "Next month",
    condition: "Flaking wood siding, requires extensive scraping",
    status: "Quoted",
    score: 72,
    source: "Google Business Profile",
    address: "840 Highland Ave, York, PA",
    createdAt: "2026-06-23",
    justification: "Large residential exterior. High prep requirements will require extra labor, but the total budget allows for substantial margin if quoted correctly.",
    actionPlan: [
      "Send custom exterior wood prep guidelines via email",
      "Follow up on the sent proposal (#EST-2024-002)",
      "Offer standard pressure washing inclusion as signing incentive"
    ]
  },
  {
    id: "lead-3",
    clientName: "Jennifer Chen",
    phone: "(717) 555-0211",
    email: "jchen@chenenterprises.com",
    clientType: "Commercial",
    budget: 24000,
    sqft: 8500,
    timeline: "Next 3 months",
    condition: "Excellent drywalls, standard retail space refresh",
    status: "Qualified",
    score: 94,
    source: "Organic Search",
    address: "24 Market St, York, PA",
    createdAt: "2026-06-20",
    justification: "Massive commercial contract with minimal preparation complexity. Highly profitable scope of standard drywall rolling.",
    actionPlan: [
      "Schedule commercial crew walk-through to confirm access hours",
      "Provide formal commercial insurance certificates and references",
      "Pitch low-odor premium coatings to maintain retail operations"
    ]
  },
  {
    id: "lead-4",
    clientName: "David Thompson",
    phone: "(717) 555-0304",
    email: "dthompson@constructpa.com",
    clientType: "Residential",
    budget: 12500,
    sqft: 4500,
    timeline: "Immediate",
    condition: "New construction, bare drywall primer + finish",
    status: "Won",
    score: 91,
    source: "Referral",
    address: "411 Whispering Pines Rd, York, PA",
    createdAt: "2026-06-18",
    justification: "Substantial new construction contract with immediate start. Zero prep scraping or washing required, enabling rapid application and high efficiency.",
    actionPlan: [
      "Dispatch color consultant to finalize paint schedule",
      "Generate and deliver initial 30% deposit invoice",
      "Assign Carlos Rodriguez's crew for immediate Monday kickoff"
    ]
  },
  {
    id: "lead-5",
    clientName: "Lisa Anderson",
    phone: "(717) 555-0155",
    email: "lisa.anderson@yahoo.com",
    clientType: "Residential",
    budget: 3200,
    sqft: 1100,
    timeline: "Flexible (next 2-3 months)",
    condition: "Fair, minor drywall dings and scuffs",
    status: "Contacted",
    score: 64,
    source: "Facebook Ads",
    address: "712 Pine Lane, York, PA",
    createdAt: "2026-06-27",
    justification: "Standard living room and kitchen color change. Good quick-turn fill-in project, but lower budget and flexible timeline keeps score in warm tier.",
    actionPlan: [
      "Send digital interactive color brochure via SMS",
      "Offer special 'mid-week opening' $250 discount for July booking",
      "Follow up in 48 hours to secure a quick walk-through"
    ]
  },
  {
    id: "lead-6",
    clientName: "Thomas Wright",
    phone: "(717) 555-0298",
    email: "twright@wrightlaw.com",
    clientType: "Commercial",
    budget: 6800,
    sqft: 2000,
    timeline: "Next month",
    condition: "Fair, law firm office repaint",
    status: "New",
    score: 80,
    source: "Google Business Profile",
    address: "15 S Duke St, York, PA",
    createdAt: "2026-06-28",
    justification: "High-end commercial office space. Customer demands premium satin trim and rich matte wall paint, commanding high labor margins.",
    actionPlan: [
      "Call Thomas to pitch weekend-only production hours to avoid disruption",
      "Provide material specs on low-VOC scrubbable eggshell coatings",
      "Draft customized premium commercial proposal"
    ]
  },
  {
    id: "lead-7",
    clientName: "Amanda Green",
    phone: "(717) 555-0312",
    email: "amanda.green@gmail.com",
    clientType: "Residential",
    budget: 5200,
    sqft: 2200,
    timeline: "Next 2 weeks",
    condition: "Poor wood trim, peeling paint on wrap-around porch",
    status: "Contacted",
    score: 75,
    source: "Direct Mail",
    address: "956 Linden Ave, York, PA",
    createdAt: "2026-06-26",
    justification: "Porch restoration and repainting. Labor-intensive scraping but highly visible local project which will yield excellent SEO reviews and photos.",
    actionPlan: [
      "Schedule porch moisture level test prior to priming",
      "Highlight premium peeling-stop bonding primer in proposal",
      "Send photos of previous historic home trim restorations"
    ]
  },
  {
    id: "lead-8",
    clientName: "Jason Vance",
    phone: "(717) 555-0450",
    email: "jvance@vanceproperties.com",
    clientType: "Residential",
    budget: 15000,
    sqft: 5000,
    timeline: "Immediate",
    condition: "Good, luxury rental turnover",
    status: "New",
    score: 88,
    source: "Referral",
    address: "115 Country Club Rd, York, PA",
    createdAt: "2026-06-29",
    justification: "High value property management turnover project. Immediate timeline with high budget potential. Repeat client opportunity.",
    actionPlan: [
      "Provide priority project slot and VIP pricing schedule",
      "Confirm availability of 4-man rapid deployment crew",
      "Draft quote for complete walls, ceilings, and baseboard packages"
    ]
  },
  {
    id: "lead-9",
    clientName: "Eleanor Vance",
    phone: "(717) 555-0488",
    email: "eleanor.v@vancedesign.com",
    clientType: "Residential",
    budget: 9500,
    sqft: 3000,
    timeline: "Next month",
    condition: "Excellent, wallpaper removal + wall styling",
    status: "Contacted",
    score: 82,
    source: "Instagram Search",
    address: "1850 Wyndham Dr, York, PA",
    createdAt: "2026-06-28",
    justification: "Designer home client. Demands specialized wallpaper stripping and high-end Farrow & Ball specialty finishes.",
    actionPlan: [
      "Have Dana Chen coordinate designer color matching session",
      "Include detailed line item for professional wallpaper steamer hours",
      "Emphasize dust-containment sanding systems to protect interiors"
    ]
  },
  {
    id: "lead-10",
    clientName: "Richard Sterling",
    phone: "(717) 555-0610",
    email: "rsterling@sterlingmfg.com",
    clientType: "Commercial",
    budget: 42000,
    sqft: 15000,
    timeline: "Next 2 months",
    condition: "Average, metal warehouse exterior siding",
    status: "Qualified",
    score: 89,
    source: "Organic Search",
    address: "1200 Industrial Hwy, York, PA",
    createdAt: "2026-06-21",
    justification: "Industrial coating project. Requires specialized direct-to-metal (DTM) coatings and hydraulic lift equipment, with highly lucrative contract scale.",
    actionPlan: [
      "Request rental lifts pricing from local equipment suppliers",
      "Verify safety training certificates for boom-lift operation",
      "Draft industrial spec proposal with commercial coating engineers"
    ]
  }
];

export const initialEstimates: Estimate[] = [
  {
    id: "EST-2024-001",
    customerName: "Sarah Williams",
    projectName: "Interior Walls Repaint",
    projectType: "Residential Interior",
    address: "124 Hillside Dr, York, PA",
    sqft: 1800,
    status: "Draft",
    value: 4500,
    date: "2026-06-25",
    details: "Standard walls painting, 2 coats. Includes standard prep.",
    laborHours: 32,
    materialCost: 800,
    prepComplexity: "Medium",
    materialTier: "Premium",
    includeTrim: false,
    includeCeiling: false
  },
  {
    id: "EST-2024-002",
    customerName: "Bob Martinez",
    projectName: "Colonial Home Exterior Restoration",
    projectType: "Residential Exterior",
    address: "840 Highland Ave, York, PA",
    sqft: 3200,
    status: "Sent",
    value: 8200,
    date: "2026-06-23",
    details: "Thorough pressure wash, intense paint scraping, primer application, and 2 finish coats of premium SW Duration Satin.",
    laborHours: 85,
    materialCost: 1500,
    prepComplexity: "High",
    materialTier: "Premium",
    includeTrim: true,
    includeCeiling: false
  },
  {
    id: "EST-2024-003",
    customerName: "Jennifer Chen",
    projectName: "Office Center Repaint",
    projectType: "Commercial Interior",
    address: "24 Market St, York, PA",
    sqft: 8500,
    status: "Sent",
    value: 24000,
    date: "2026-06-20",
    details: "Commercial office repaint. Low odor coatings, 2 coats, weekend hours production.",
    laborHours: 160,
    materialCost: 3500,
    prepComplexity: "Low",
    materialTier: "Starter",
    includeTrim: true,
    includeCeiling: false
  },
  {
    id: "EST-2024-004",
    customerName: "David Thompson",
    projectName: "Luxury New Construction Paint",
    projectType: "Residential Interior",
    address: "411 Whispering Pines Rd, York, PA",
    sqft: 4500,
    status: "Accepted",
    value: 12500,
    date: "2026-06-18",
    details: "Full bare drywall sealer/primer application plus 2 finish coats of SW Emerald. Includes premium trim and ceilings throughout.",
    laborHours: 90,
    materialCost: 2400,
    prepComplexity: "Low",
    materialTier: "Ultra",
    includeTrim: true,
    includeCeiling: true
  },
  {
    id: "EST-2024-005",
    customerName: "Lisa Anderson",
    projectName: "Kitchen & Living Room Refresh",
    projectType: "Residential Interior",
    address: "712 Pine Lane, York, PA",
    sqft: 1100,
    status: "Accepted",
    value: 3200,
    date: "2026-06-27",
    details: "Color change on walls and baseboards. Minor patching of small drywall holes.",
    laborHours: 24,
    materialCost: 550,
    prepComplexity: "Medium",
    materialTier: "Premium",
    includeTrim: true,
    includeCeiling: false
  },
  {
    id: "EST-2024-006",
    customerName: "Thomas Wright",
    projectName: "Law Offices Styling",
    projectType: "Commercial Interior",
    address: "15 S Duke St, York, PA",
    sqft: 2000,
    status: "Draft",
    value: 6800,
    date: "2026-06-28",
    details: "Repainting of executive suites and client waiting lobby using deep accent colors and premium semi-gloss woodwork coating.",
    laborHours: 50,
    materialCost: 1100,
    prepComplexity: "Medium",
    materialTier: "Ultra",
    includeTrim: true,
    includeCeiling: false
  },
  {
    id: "EST-2024-007",
    customerName: "Amanda Green",
    projectName: "Porch Trim & Porch Deck Restoration",
    projectType: "Residential Exterior",
    address: "956 Linden Ave, York, PA",
    sqft: 2200,
    status: "Rejected",
    value: 5200,
    date: "2026-06-26",
    details: "Porch repaint and deck sanding + oil staining. Customer selected lower local bidder.",
    laborHours: 65,
    materialCost: 950,
    prepComplexity: "High",
    materialTier: "Premium",
    includeTrim: true,
    includeCeiling: false
  },
  {
    id: "EST-2024-008",
    customerName: "Richard Sterling",
    projectName: "Metal Siding Facade Coating",
    projectType: "Commercial Exterior",
    address: "1200 Industrial Hwy, York, PA",
    sqft: 15000,
    status: "Sent",
    value: 42000,
    date: "2026-06-21",
    details: "Power washing at 4000 PSI, rust converter spot application, and spray application of professional DTM industrial coating.",
    laborHours: 220,
    materialCost: 8500,
    prepComplexity: "High",
    materialTier: "Ultra",
    includeTrim: false,
    includeCeiling: false
  }
];

export const initialProjects: Project[] = [
  {
    id: "proj-1",
    name: "Luxury New Construction Paint",
    customerName: "David Thompson",
    address: "411 Whispering Pines Rd, York, PA",
    crewAssigned: ["Carlos Rodriguez", "Marcus Williams"],
    status: "Active",
    progress: 65,
    contractValue: 12500,
    margin: 42,
    startDate: "2026-06-22",
    photos: [
      { phase: "Before", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=60" },
      { phase: "During", url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=60" }
    ],
    checklist: [
      { id: "c1", label: "Surface Preparation Complete (drywall sanding, sweeping)", checked: true, photosCount: 3, photosRequired: 3 },
      { id: "c2", label: "Primer Coat Fully Applied", checked: true, photosCount: 2, photosRequired: 2 },
      { id: "c3", label: "First Finishing Coat Complete", checked: true, photosCount: 2, photosRequired: 2 },
      { id: "c4", label: "Second Finishing Coat Complete", checked: false, photosCount: 1, photosRequired: 2 },
      { id: "c5", label: "Final Walk-Through & Cleanup", checked: false, photosCount: 0, photosRequired: 5 }
    ]
  },
  {
    id: "proj-2",
    name: "Kitchen & Living Room Refresh",
    customerName: "Lisa Anderson",
    address: "712 Pine Lane, York, PA",
    crewAssigned: ["Jake Thompson"],
    status: "Active",
    progress: 90,
    contractValue: 3200,
    margin: 38,
    startDate: "2026-06-26",
    photos: [
      { phase: "Before", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=60" },
      { phase: "During", url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&auto=format&fit=crop&q=60" }
    ],
    checklist: [
      { id: "lc1", label: "Surface Prep Complete (caulk, minor patching)", checked: true, photosCount: 3, photosRequired: 3 },
      { id: "lc2", label: "Primer Coating (where patched)", checked: true, photosCount: 2, photosRequired: 2 },
      { id: "lc3", label: "First Coat Complete", checked: true, photosCount: 2, photosRequired: 2 },
      { id: "lc4", label: "Second Coat Complete", checked: true, photosCount: 2, photosRequired: 2 },
      { id: "lc5", label: "Final Walk-Through & Cleanup", checked: false, photosCount: 2, photosRequired: 5 }
    ]
  },
  {
    id: "proj-3",
    name: "Colonial Home Exterior Restoration",
    customerName: "Bob Martinez",
    address: "840 Highland Ave, York, PA",
    crewAssigned: ["Carlos Rodriguez", "Marcus Williams", "Jake Thompson"],
    status: "Scheduled",
    progress: 0,
    contractValue: 8200,
    margin: 34,
    startDate: "2026-07-02",
    photos: [],
    checklist: [
      { id: "ec1", label: "Power washing of wood panels", checked: false, photosCount: 0, photosRequired: 3 },
      { id: "ec2", label: "Extensive scraping & wood sanding", checked: false, photosCount: 0, photosRequired: 3 },
      { id: "ec3", label: "Apply wood sealer/primer", checked: false, photosCount: 0, photosRequired: 2 },
      { id: "ec4", label: "Body first and second coats finish", checked: false, photosCount: 0, photosRequired: 4 },
      { id: "ec5", label: "Trim details, windows and doors enamel", checked: false, photosCount: 0, photosRequired: 3 }
    ]
  },
  {
    id: "proj-4",
    name: "Suburban Living Room Repaint",
    customerName: "Eleanor Vance",
    address: "1850 Wyndham Dr, York, PA",
    crewAssigned: ["Jake Thompson"],
    status: "On Hold",
    progress: 40,
    contractValue: 4800,
    margin: 40,
    startDate: "2026-06-24",
    photos: [
      { phase: "Before", url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&auto=format&fit=crop&q=60" }
    ],
    checklist: [
      { id: "vc1", label: "Wallpaper Removal & Sizing", checked: true, photosCount: 3, photosRequired: 3 },
      { id: "vc2", label: "Plaster repair & dry sanding", checked: false, photosCount: 0, photosRequired: 2 },
      { id: "vc3", label: "Primer coat application", checked: false, photosCount: 0, photosRequired: 2 },
      { id: "vc4", label: "Finishing coats", checked: false, photosCount: 0, photosRequired: 4 }
    ]
  },
  {
    id: "proj-5",
    name: "Retail Front Facade Paint",
    customerName: "Jennifer Chen",
    address: "24 Market St, York, PA",
    crewAssigned: ["Carlos Rodriguez", "Marcus Williams"],
    status: "Completed",
    progress: 100,
    contractValue: 18500,
    margin: 45,
    startDate: "2026-06-10",
    endDate: "2026-06-15",
    photos: [
      { phase: "Before", url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&auto=format&fit=crop&q=60" },
      { phase: "During", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=60" },
      { phase: "After", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=60" }
    ],
    checklist: [
      { id: "rc1", label: "Night pressure wash & metal prep", checked: true, photosCount: 3, photosRequired: 3 },
      { id: "rc2", label: "Sanding & masking windows", checked: true, photosCount: 2, photosRequired: 2 },
      { id: "rc3", label: "DTM rust prevention primer", checked: true, photosCount: 2, photosRequired: 2 },
      { id: "rc4", label: "Spray coating finish (2 coats)", checked: true, photosCount: 2, photosRequired: 2 },
      { id: "rc5", label: "Final customer walk-through and signature", checked: true, photosCount: 5, photosRequired: 5 }
    ]
  }
];

export const initialCrewMembers: CrewMember[] = [
  {
    id: "crew-1",
    name: "Carlos Rodriguez",
    role: "Lead Painter",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
    skills: ["Exterior", "Wood Sanding", "Pressure Washing", "Satin Enamel"],
    hoursThisWeek: 42,
    productivityScore: 96,
    status: "Active"
  },
  {
    id: "crew-2",
    name: "Marcus Williams",
    role: "Painter",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60",
    skills: ["Interior", "Drywall Mudding", "Spraying", "Accent Walls"],
    hoursThisWeek: 38,
    productivityScore: 89,
    status: "Active"
  },
  {
    id: "crew-3",
    name: "Jake Thompson",
    role: "Painter",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
    skills: ["Interior", "Cabinet Prep", "Wall Brushwork", "Taping"],
    hoursThisWeek: 40,
    productivityScore: 91,
    status: "Active"
  },
  {
    id: "crew-4",
    name: "Dana Chen",
    role: "Estimator",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60",
    skills: ["Sales", "Color Consultation", "Residential Estimation", "GBP Marketing"],
    hoursThisWeek: 35,
    productivityScore: 94,
    status: "Active"
  }
];

export const initialCrews: Crew[] = [
  { id: "crew-a", leader: "Carlos Rodriguez", membersCount: 4, status: "On-site" },
  { id: "crew-b", leader: "Sarah Lindqvist", membersCount: 3, status: "Standby" },
  { id: "crew-c", leader: "Darryl Vance", membersCount: 5, status: "Dispatched" }
];

export const initialCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "York Summer Home Exterior Promo",
    type: "Email",
    status: "Active",
    sent: 1200,
    delivered: 1185,
    opened: 642,
    clicks: 189,
    leadsGenerated: 24,
    spend: 150
  },
  {
    id: "camp-2",
    name: "Spring Decks Pressure Wash SMS",
    type: "SMS",
    status: "Completed",
    sent: 500,
    delivered: 498,
    opened: 470,
    clicks: 110,
    leadsGenerated: 18,
    spend: 60
  },
  {
    id: "camp-3",
    name: "Google Local Search Ads - York Painters",
    type: "Google Ads",
    status: "Active",
    sent: 18400, // Impressions for Ads
    delivered: 18400,
    opened: 1250, // Clicks for Ads
    clicks: 1250,
    leadsGenerated: 42,
    spend: 850
  },
  {
    id: "camp-4",
    name: "Historic Trim Restorations Facebook Campaign",
    type: "Facebook Ads",
    status: "Active",
    sent: 12500, // Impressions
    delivered: 12500,
    opened: 580, // Clicks
    clicks: 580,
    leadsGenerated: 19,
    spend: 400
  },
  {
    id: "camp-5",
    name: "North York Neighborhood Direct Mail Postcard",
    type: "Direct Mail",
    status: "Scheduled",
    sent: 1500,
    delivered: 0,
    opened: 0,
    clicks: 0,
    leadsGenerated: 0,
    spend: 950
  }
];

export const initialReviews: Review[] = [
  {
    id: "rev-1",
    author: "Eleanor Vance",
    platform: "Google",
    rating: 5,
    content: "Absolutely phenomenal craftsmanship! Mike and Carlos Rodriguez's crew refinished our cabinets and painted the entire designer living room. Meticulous preparation work indeed, they spent almost two days sanding and taping. The semi-gloss woodwork is pristine.",
    date: "2026-06-25",
    replied: true,
    replyText: "Thank you so much Eleanor! It was a pleasure working with your design concepts. Meticulous preparation is our top standard to guarantee a lasting finish!"
  },
  {
    id: "rev-2",
    author: "Richard Sterling",
    platform: "Google",
    rating: 5,
    content: "Fast, professional, and very thorough safety standards. They spray coated our metal warehouse siding facade. Crew completed the work over one weekend so our business operations weren't disrupted. Highly recommend for commercial painting projects.",
    date: "2026-06-22",
    replied: true,
    replyText: "Appreciate the recommendation, Richard! Our commercial crews are fully trained in scaffolding safety and low-disruption schedules. Glad we could hit your target date!"
  },
  {
    id: "rev-3",
    author: "Sarah Jenkins",
    platform: "Yelp",
    rating: 5,
    content: "Brush & Co. made painting our new kitchen and living room so easy. From the online calculator estimate to the rapid crew execution, the service was highly premium. They even cleaned up fully with zero dust left behind.",
    date: "2026-06-18",
    replied: false
  },
  {
    id: "rev-4",
    author: "David Thompson",
    platform: "Facebook",
    rating: 5,
    content: "Best painters in York County. Complete new construction custom project with beautiful emerald rainrefresh coats. Zero issues, highly responsive.",
    date: "2026-06-15",
    replied: false
  }
];

export const initialInvoices: Invoice[] = [
  { id: "INV-2024-101", customerName: "David Thompson", amount: 3750, dueDate: "2026-06-22", status: "Paid", daysOverdue: 0 },
  { id: "INV-2024-102", customerName: "David Thompson", amount: 5000, dueDate: "2026-07-15", status: "Current", daysOverdue: 0 },
  { id: "INV-2024-103", customerName: "Lisa Anderson", amount: 1600, dueDate: "2026-06-25", status: "Paid", daysOverdue: 0 },
  { id: "INV-2024-104", customerName: "Lisa Anderson", amount: 1600, dueDate: "2026-07-10", status: "Current", daysOverdue: 0 },
  { id: "INV-2024-105", customerName: "Bob Martinez", amount: 2460, dueDate: "2026-06-20", status: "Overdue", daysOverdue: 9 },
  { id: "INV-2024-106", customerName: "Jennifer Chen", amount: 7200, dueDate: "2026-06-15", status: "Overdue", daysOverdue: 14 },
  { id: "INV-2024-107", customerName: "Eleanor Vance", amount: 4800, dueDate: "2026-06-29", status: "Current", daysOverdue: 0 }
];

export const initialExpenses: Expense[] = [
  { id: "EXP-01", description: "SW Emerald Base Matte Paint (15 Gal) & Primers", category: "Materials", amount: 840, date: "2026-06-21", projectAllocated: "Luxury New Construction Paint" },
  { id: "EXP-02", description: "Carlos Rodriguez Crew Lead Payroll Week 25", category: "Labor", amount: 1680, date: "2026-06-26", projectAllocated: "Luxury New Construction Paint" },
  { id: "EXP-03", description: "Marcus Williams Payroll Week 25", category: "Labor", amount: 1220, date: "2026-06-26", projectAllocated: "Luxury New Construction Paint" },
  { id: "EXP-04", description: "Work Crew Truck Unleaded Fuel", category: "Fuel", amount: 110, date: "2026-06-24" },
  { id: "EXP-05", description: "Boom Lift Rental - 3 Days (Industrial Highway Siding)", category: "Equipment", amount: 650, date: "2026-06-19", projectAllocated: "Retail Front Facade Paint" },
  { id: "EXP-06", description: "Google Business Search Advertising Budget", category: "Marketing", amount: 350, date: "2026-06-15" },
  { id: "EXP-07", description: "Contractor Liability Premium Month Payment", category: "Insurance", amount: 420, date: "2026-06-01" }
];

export const initialSOPs: SOP[] = [
  {
    id: "sop-1",
    title: "Meticulous Surface Prep & Washing",
    description: "Standard checklist for residential exterior siding, ensuring all debris, chalking and loose chips are eradicated before applying primer coats.",
    role: "Apprentice / Prep Crew",
    videoLink: "https://www.w3schools.com/html/mov_bbb.mp4",
    checklist: [
      "Power wash at 2500-3000 PSI, holding nozzle 12 inches away to avoid splitting wood",
      "Apply bleach solution treatment to areas of mold, let stand for 10 minutes, and rinse thoroughly",
      "Scrape loose paint with 2.5-inch carbide blades, pulling with the wood grain",
      "Feather-sand scraped margins with 80-grit pads until transitions are flat and touch-smooth",
      "Fill all nail-holes with premium outdoor-rated elastomeric compound"
    ]
  },
  {
    id: "sop-2",
    title: "Satin Wood Trim Brush Technique",
    description: "Lead painter method to coat window frames, doors, and dental moldings smoothly with zero visible brush marks.",
    role: "Lead Journeyman Painter",
    videoLink: "https://www.w3schools.com/html/mov_bbb.mp4",
    checklist: [
      "Select a clean 2.5-inch angled Purdy chinex brush",
      "Slightly moisten bristles with water (for latex acrylics) and spin out excess moisture",
      "Dip brush only 1/3 of the bristle length into the premium satin enamel",
      "Paint from dry areas back into wet paint margins, lifting brush smoothly in single continuous strokes",
      "Check corners immediately with a dry brush tip to catch runs or build-ups"
    ]
  },
  {
    id: "sop-3",
    title: "High-End Cabinet Prep & Spray Setup",
    description: "Meticulous dust containment and masking procedures for premium interior kitchen cabinet lacquer conversions.",
    role: "Lead Journeyman Painter",
    checklist: [
      "Erect zipped zipwall barriers around active kitchen area, masking floor and ceiling margins",
      "Remove all doors, hinges, drawer fronts and place in dedicated numbering catalog",
      "Thoroughly clean doors with TSP degreaser solution to strip hand grease and kitchen oils",
      "Sand panels down to raw wood using Festool HEPA-vacuum sanders with 150-grit pads",
      "Prime panels with fast-dry shellac base, and sand flat with 220-grit before spray coatings"
    ]
  },
  {
    id: "sop-4",
    title: "Ladder & Extension Scaffold Safety",
    description: "Mandatory corporate safety protocols for high ladder setups and fall prevention measures on commercial facades.",
    role: "All Crew Members",
    checklist: [
      "Ensure ladder feet are established on fully flat, consolidated surfaces with level-bars if needed",
      "Establish ladder base utilizing the 4:1 slope ratio rule (1 foot out for every 4 feet up)",
      "Always maintain three points of active touch (two feet, one hand) during climbing",
      "Wear approved full safety harness and attach lanyard to load-rated ridge hooks on roofs",
      "Verify ladder extensions rise a minimum of 3 feet above landing margins"
    ]
  }
];

export const monthlyRevenueData = [
  { name: "Jul 25", revenue: 48000, expenses: 31000, cashFlow: 17000 },
  { name: "Aug 25", revenue: 52000, expenses: 33500, cashFlow: 18500 },
  { name: "Sep 25", revenue: 55000, expenses: 34000, cashFlow: 21000 },
  { name: "Oct 25", revenue: 49000, expenses: 32000, cashFlow: 17000 },
  { name: "Nov 25", revenue: 45000, expenses: 30000, cashFlow: 15000 },
  { name: "Dec 25", revenue: 47000, expenses: 29500, cashFlow: 17500 },
  { name: "Jan 26", revenue: 58000, expenses: 36000, cashFlow: 22000 },
  { name: "Feb 26", revenue: 62000, expenses: 38200, cashFlow: 23800 },
  { name: "Mar 26", revenue: 71000, expenses: 44000, cashFlow: 27000 },
  { name: "Apr 26", revenue: 82000, expenses: 51000, cashFlow: 31000 },
  { name: "May 26", revenue: 89000, expenses: 55000, cashFlow: 34000 },
  { name: "Jun 26", revenue: 95000, expenses: 58500, cashFlow: 36500 }
];

export const leadSourcesData = [
  { name: "Google Ads", value: 42, color: "#3B82F6" },
  { name: "Organic Search", value: 28, color: "#10B981" },
  { name: "Yelp / Reviews", value: 15, color: "#EF4444" },
  { name: "Referrals", value: 10, color: "#F59E0B" },
  { name: "Facebook Ads", value: 5, color: "#8B5CF6" }
];
