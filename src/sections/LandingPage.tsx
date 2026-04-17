import { useState, useRef, useMemo } from "react";
import type { UserRole } from "@/App";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
}

type ThemeMode = "dark" | "light";
type View =
  | "home"
  | "service"
  | "provider"
  | "booking"
  | "chat"
  | "legal-home"
  | "legal-privacy"
  | "legal-terms"
  | "legal-cookies"
  | "legal-compliance";

// ─── Static Data ──────────────────────────────────────────────────────────────
const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Angola","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bangladesh","Belarus","Belgium","Bolivia","Brazil","Bulgaria","Cambodia",
  "Cameroon","Canada","Chile","China","Colombia","Congo","Costa Rica","Croatia","Cuba",
  "Czech Republic","Denmark","DR Congo","Ecuador","Egypt","Ethiopia","Finland","France",
  "Germany","Ghana","Greece","Guatemala","Hungary","India","Indonesia","Iran","Iraq",
  "Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kenya","Kuwait","Latvia",
  "Lebanon","Libya","Lithuania","Madagascar","Malaysia","Mexico","Morocco","Mozambique",
  "Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Nigeria","Norway",
  "Oman","Pakistan","Panama","Peru","Philippines","Poland","Portugal","Qatar","Romania",
  "Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Singapore","Slovakia","Somalia",
  "South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Sweden",
  "Switzerland","Syria","Taiwan","Tanzania","Thailand","Tunisia","Turkey","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay",
  "Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

const categories = [
  { name: "Home Care",  id: "home-care",  img: "/assets/hRM4Ajo6It08.jpg" },
  { name: "Health",     id: "health",     img: "/assets/EJMQG8XV7o5p.jpg" },
  { name: "Business",   id: "business",   img: "/assets/PWBvy7opzPH3.jpg" },
  { name: "Beauty",     id: "beauty",     img: "/assets/Tipzu9TMn4Cv.jpg" },
  { name: "Repair",     id: "repair",     img: "/assets/U3PxX0kpi26v.jpg" },
  { name: "Education",  id: "education",  img: "/assets/slhZ1AZeARPM.jpg" },
  { name: "Travel",     id: "travel",     img: "/assets/ua0vI8ZBzDBR.png"  },
  { name: "Legal",      id: "legal",      img: "/assets/pXCA6IKLi1TM.jpg" },
];

const allServices = [
  {
    id: "spot-1", name: "Priority Home Repair",
    description: "Same-day support for plumbing, electrical, and general maintenance.",
    fullDescription: "Our certified handymen provide same-day emergency and scheduled repairs for plumbing, electrical faults, carpentry, painting, and general maintenance. All work is insured and backed by a 90-day satisfaction guarantee. Available 7 days a week including public holidays.",
    provider: "UrbanFix Collective", category: "Home Care", badge: "Trending",
    rating: 4.8, reviews: 183, price: "From $55/hr", duration: "Flexible",
    location: "On-site", tags: ["Plumbing","Electrical","Carpentry"],
    image: "/assets/hRM4Ajo6It08.jpg",
  },
  {
    id: "spot-2", name: "Virtual Wellness Sessions",
    description: "Licensed specialists for fast digital consultations across regions.",
    fullDescription: "Connect with wellness coaches, dietitians, physiotherapists, and mental health practitioners via secure video sessions. Available 7 days a week. Packages available for individuals, couples, and corporate teams. All practitioners are licensed and vetted.",
    provider: "CareBridge Network", category: "Health", badge: "Popular",
    rating: 4.9, reviews: 214, price: "From $40/session", duration: "50 min",
    location: "Remote / Video", tags: ["Wellness","Mental Health","Nutrition"],
    image: "/assets/EJMQG8XV7o5p.jpg",
  },
  {
    id: "spot-3", name: "Business Launch Support",
    description: "Compliance, branding, and operational setup from curated experts.",
    fullDescription: "End-to-end support for new business owners — company registration, regulatory compliance, accounting setup, brand kit, and a 90-day growth roadmap. Ideal for first-time entrepreneurs and international businesses expanding into new markets.",
    provider: "ScaleStart Partners", category: "Business", badge: "New",
    rating: 4.7, reviews: 89, price: "From $299/package", duration: "2 weeks",
    location: "Remote", tags: ["Startup","Compliance","Branding"],
    image: "/assets/PWBvy7opzPH3.jpg",
  },
  {
    id: "spot-4", name: "Premium Event Staffing",
    description: "Trained coordinators, hosts, and support teams for live events.",
    fullDescription: "Source experienced event staff for conferences, weddings, product launches, and private functions. All team members are briefed on your event specifics and are available for multi-day engagements. Fully insured and background-checked.",
    provider: "VenueOps Studio", category: "Events", badge: "Hot",
    rating: 4.8, reviews: 156, price: "From $150/day", duration: "Full day",
    location: "Your venue", tags: ["Events","Staffing","Weddings"],
    image: "/assets/pXCA6IKLi1TM.jpg",
  },
  {
    id: "s1", name: "Remote Tax Advisory",
    description: "Personalized filing guidance and year-round business tax support.",
    fullDescription: "Certified tax advisors for individuals and businesses. We handle VAT returns, corporate tax filings, payroll compliance, and cross-border tax planning. Available remotely across 40+ countries with same-week appointment slots.",
    provider: "Northstar Advisory", category: "Business", badge: undefined,
    rating: 4.8, reviews: 156, price: "From $80/session", duration: "60 min",
    location: "Remote / Worldwide", tags: ["Tax","Finance","Compliance"],
    image: "/assets/PWBvy7opzPH3.jpg",
  },
  {
    id: "s2", name: "Home Deep Cleaning",
    description: "Recurring and one-time cleaning packages for homes and apartments.",
    fullDescription: "Professional, fully insured cleaning teams equipped with eco-friendly products. We cover kitchens, bathrooms, bedrooms, living areas, and outdoor spaces. Move-in/move-out specials available. All staff are background-checked and trained.",
    provider: "PureSpace Services", category: "Home Care", badge: "Most Booked",
    rating: 4.9, reviews: 342, price: "From $45/visit", duration: "2–4 hours",
    location: "On-site", tags: ["Cleaning","Home","Eco-Friendly"],
    image: "/assets/hRM4Ajo6It08.jpg",
  },
  {
    id: "s3", name: "Telehealth Consultations",
    description: "Connect with vetted clinicians for primary care and follow-up support.",
    fullDescription: "Access licensed doctors, nurses, and specialists from your phone or computer. We support general consultations, chronic disease management, mental health check-ins, prescription renewals, and second opinions. Available 7 days a week.",
    provider: "HealthSphere", category: "Health", badge: "Trending",
    rating: 4.7, reviews: 289, price: "From $30/session", duration: "30 min",
    location: "Remote / Video", tags: ["Health","Telemedicine","Doctor"],
    image: "/assets/EJMQG8XV7o5p.jpg",
  },
  {
    id: "s4", name: "Brand Identity Sprint",
    description: "Logo, messaging, and visual direction for growing digital brands.",
    fullDescription: "A focused 5-day engagement to build your brand from scratch. Deliverables include logo suite, color palette, typography system, brand voice guidelines, and a one-page website mockup. Ideal for startups and relaunching businesses.",
    provider: "Studio Atlas", category: "Business", badge: "New",
    rating: 4.9, reviews: 127, price: "From $499/project", duration: "5 days",
    location: "Remote", tags: ["Branding","Design","Startup","Logo"],
    image: "/assets/pXCA6IKLi1TM.jpg",
  },
  {
    id: "s5", name: "Mobile Hair & Makeup",
    description: "On-location beauty professionals for events, shoots, and weddings.",
    fullDescription: "Our mobile beauty team travels to your venue — whether it's your home, hotel, or event space. Specializing in bridal hair and makeup, editorial looks, corporate headshot prep, and prom/graduation styling. All kits are hypoallergenic and professional grade.",
    provider: "GlowLine Collective", category: "Beauty", badge: "Hot",
    rating: 4.8, reviews: 198, price: "From $120/artist", duration: "2–3 hours",
    location: "Your location", tags: ["Beauty","Hair","Makeup","Bridal"],
    image: "/assets/Tipzu9TMn4Cv.jpg",
  },
  {
    id: "s6", name: "Language Coaching",
    description: "Private online lessons tailored to exams, work, and relocation goals.",
    fullDescription: "1-on-1 coaching with native speakers and certified instructors. We offer English, French, Spanish, Arabic, Swahili, and Mandarin. Courses are structured for IELTS/TOEFL prep, business communication, conversational fluency, and relocation readiness.",
    provider: "FluentPath Academy", category: "Education", badge: undefined,
    rating: 4.6, reviews: 94, price: "From $25/hour", duration: "60 min",
    location: "Remote / Video", tags: ["Language","Education","IELTS"],
    image: "/assets/slhZ1AZeARPM.jpg",
  },
  {
    id: "s7", name: "Smart Device Repair",
    description: "Certified technicians for diagnostics, repairs, and setup assistance.",
    fullDescription: "We repair smartphones, tablets, laptops, and smart home devices. Services include screen replacement, battery swap, water damage recovery, software restoration, and full device setup. Most repairs completed same day. Walk-in or home visit available.",
    provider: "DeviceLab", category: "Repair", badge: "Popular",
    rating: 4.9, reviews: 267, price: "From $35/repair", duration: "1–4 hours",
    location: "In-store or home visit", tags: ["Repair","Tech","Phones","Laptops"],
    image: "/assets/U3PxX0kpi26v.jpg",
  },
  {
    id: "s8", name: "Travel Documentation Help",
    description: "Support with visa preparation, itinerary planning, and trip readiness.",
    fullDescription: "Our travel specialists assist with visa applications, travel insurance selection, customs documentation, and tailored itinerary building. We cover 60+ destination countries and offer emergency support for last-minute travel issues.",
    provider: "GlobeDesk Support", category: "Travel", badge: undefined,
    rating: 4.7, reviews: 112, price: "From $60/consultation", duration: "45 min",
    location: "Remote", tags: ["Travel","Visa","Documentation"],
    image: "/assets/ua0vI8ZBzDBR.png",
  },
];

const providerData: Record<string, {
  bio: string; since: string; responseTime: string; languages: string;
  reviews: { name: string; rating: number; text: string; date: string }[];
}> = {
  "UrbanFix Collective":  { bio: "A collective of certified handymen and contractors with 10+ years of experience in urban home repair.", since: "2019", responseTime: "< 30 min", languages: "English, Swahili", reviews: [{ name:"James K.", rating:5, text:"Fast, professional, and fair pricing.", date:"Jan 2025" },{ name:"Amara O.", rating:5, text:"Fixed our burst pipe within 2 hours. Excellent!", date:"Dec 2024" },{ name:"Sarah M.", rating:4, text:"Great team, thorough work.", date:"Nov 2024" }] },
  "CareBridge Network":   { bio: "A network of licensed health practitioners providing accessible digital healthcare.", since: "2020", responseTime: "< 1 hour", languages: "English, French, Arabic", reviews: [{ name:"Priya S.", rating:5, text:"The dietitian was incredibly knowledgeable.", date:"Jan 2025" },{ name:"David L.", rating:5, text:"My sessions have transformed my wellbeing.", date:"Dec 2024" },{ name:"Fatima A.", rating:4, text:"Easy to use, very professional staff.", date:"Nov 2024" }] },
  "ScaleStart Partners":  { bio: "Business consultants helping entrepreneurs launch and grow with confidence.", since: "2018", responseTime: "< 2 hours", languages: "English, Portuguese, French", reviews: [{ name:"Carlos M.", rating:5, text:"Helped me register my company in 3 days.", date:"Jan 2025" },{ name:"Ngozi B.", rating:5, text:"Saved me months of paperwork.", date:"Dec 2024" },{ name:"Lin W.", rating:4, text:"Very thorough and professional.", date:"Nov 2024" }] },
  "VenueOps Studio":      { bio: "Event management professionals with experience in corporate and private events across 20+ countries.", since: "2017", responseTime: "< 3 hours", languages: "English, Spanish", reviews: [{ name:"Sofia R.", rating:5, text:"Our event ran flawlessly.", date:"Jan 2025" },{ name:"Ahmed K.", rating:5, text:"Staff were polished and proactive.", date:"Dec 2024" },{ name:"Emma T.", rating:5, text:"Will definitely use again.", date:"Nov 2024" }] },
  "Northstar Advisory":   { bio: "Certified accountants and tax specialists serving individuals and SMEs globally.", since: "2016", responseTime: "< 4 hours", languages: "English, French, Swahili", reviews: [{ name:"Mark P.", rating:5, text:"Saved me thousands in tax.", date:"Jan 2025" },{ name:"Aisha N.", rating:4, text:"Very clear and patient explanations.", date:"Dec 2024" },{ name:"Tom H.", rating:5, text:"Best tax advisor I've used.", date:"Nov 2024" }] },
  "PureSpace Services":   { bio: "Eco-conscious cleaning professionals for homes and offices across major cities.", since: "2020", responseTime: "< 1 hour", languages: "English, Swahili", reviews: [{ name:"Lucy W.", rating:5, text:"My house has never been this clean!", date:"Jan 2025" },{ name:"Brian O.", rating:5, text:"Consistent and reliable every week.", date:"Dec 2024" },{ name:"Nina J.", rating:4, text:"Great products, no harsh smells.", date:"Nov 2024" }] },
  "HealthSphere":         { bio: "A digital health platform connecting patients with vetted clinicians worldwide.", since: "2019", responseTime: "< 30 min", languages: "English, French, Arabic, Swahili", reviews: [{ name:"Rita A.", rating:5, text:"Prescribed the right medication remotely.", date:"Jan 2025" },{ name:"Kofi M.", rating:5, text:"No waiting room — incredibly convenient.", date:"Dec 2024" },{ name:"Anna B.", rating:4, text:"Good follow-up care.", date:"Nov 2024" }] },
  "Studio Atlas":         { bio: "Creative studio specializing in brand identity, digital design, and visual strategy.", since: "2018", responseTime: "< 3 hours", languages: "English, French", reviews: [{ name:"Jake L.", rating:5, text:"Our brand looks incredible now.", date:"Jan 2025" },{ name:"Zara K.", rating:5, text:"Nailed our vision on the first try.", date:"Dec 2024" },{ name:"Marco R.", rating:4, text:"Highly creative and communicative.", date:"Nov 2024" }] },
  "GlowLine Collective":  { bio: "Mobile beauty professionals available for all occasions — from weddings to photoshoots.", since: "2021", responseTime: "< 2 hours", languages: "English, French, Swahili", reviews: [{ name:"Bride J.", rating:5, text:"I felt absolutely stunning on my wedding day.", date:"Jan 2025" },{ name:"Keiko T.", rating:5, text:"Perfect for our editorial shoot.", date:"Dec 2024" },{ name:"Chloe B.", rating:5, text:"So talented and easy to work with.", date:"Nov 2024" }] },
  "FluentPath Academy":   { bio: "Language coaching for professionals, students, and relocating individuals.", since: "2020", responseTime: "< 4 hours", languages: "Multiple — see services", reviews: [{ name:"Omar S.", rating:5, text:"Passed my IELTS with band 8 thanks to FluentPath.", date:"Jan 2025" },{ name:"Ingrid L.", rating:4, text:"Great for business English.", date:"Dec 2024" },{ name:"Yuki H.", rating:5, text:"Patient, structured, and fun.", date:"Nov 2024" }] },
  "DeviceLab":            { bio: "Certified repair technicians for all major device brands, with a fastest-in-city promise.", since: "2017", responseTime: "< 30 min", languages: "English, French", reviews: [{ name:"Chris F.", rating:5, text:"Phone screen replaced in under an hour.", date:"Jan 2025" },{ name:"Sandra M.", rating:5, text:"Recovered all my data — lifesavers!", date:"Dec 2024" },{ name:"Rahul G.", rating:4, text:"Good service, fair pricing.", date:"Nov 2024" }] },
  "GlobeDesk Support":    { bio: "Travel specialists helping you navigate documentation, visas, and itinerary planning for 60+ countries.", since: "2019", responseTime: "< 2 hours", languages: "English, French, Arabic, Portuguese", reviews: [{ name:"Hana Y.", rating:5, text:"Got my visa approved first try.", date:"Jan 2025" },{ name:"Pierre M.", rating:5, text:"Saved me from a costly mistake.", date:"Dec 2024" },{ name:"Layla A.", rating:4, text:"Very knowledgeable and responsive.", date:"Nov 2024" }] },
};

const legalContent = {
  privacy: {
    title: "Privacy Policy", updated: "January 2025",
    sections: [
      { h: "1. Information We Collect", p: "We collect information you provide directly to us when creating an account, booking a service, or communicating with providers. This includes your name, email address, phone number, location data, and payment information. We also automatically collect usage data, device identifiers, and cookies when you interact with our platform." },
      { h: "2. How We Use Your Information", p: "Your information is used to provide, personalise, and improve the Q-LINK platform; process bookings and payments; send service confirmations and updates; detect and prevent fraud; comply with legal obligations; and send you marketing communications where you have given consent." },
      { h: "3. Sharing of Information", p: "We share your information with service providers as necessary to fulfil bookings, with payment processors for transaction handling, with identity verification partners, and with legal authorities when required by law. We do not sell your personal data to third parties." },
      { h: "4. Data Retention", p: "We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting support@qlink.app." },
      { h: "5. Your Rights", p: "Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict the processing of your data. You also have the right to data portability and to withdraw consent at any time. Contact us at privacy@qlink.app to exercise these rights." },
      { h: "6. Contact", p: "For privacy-related inquiries, contact our Data Protection Officer at dpo@qlink.app." },
    ],
  },
  terms: {
    title: "Terms of Service", updated: "January 2025",
    sections: [
      { h: "1. Acceptance of Terms", p: "By accessing or using Q-LINK, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use the platform. We reserve the right to update these terms at any time; continued use of the platform after changes constitutes acceptance." },
      { h: "2. User Accounts", p: "You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to create an account. You agree to provide accurate information and to notify us promptly of any unauthorised use of your account." },
      { h: "3. Service Booking", p: "Q-LINK acts as a marketplace connecting customers with independent service providers. We do not employ providers directly. All bookings are subject to provider availability and acceptance. Q-LINK is not liable for the quality or outcome of services rendered by third-party providers." },
      { h: "4. Payments & Refunds", p: "Payments are processed securely through our payment partners. Refunds are subject to the provider's cancellation policy. Q-LINK charges a platform fee on each completed booking. Disputes must be raised within 48 hours of service completion." },
      { h: "5. Prohibited Conduct", p: "You may not use Q-LINK for unlawful purposes, to harass or defraud others, to impersonate any person, or to introduce malicious software. Violation of these terms may result in immediate account suspension." },
      { h: "6. Limitation of Liability", p: "To the maximum extent permitted by law, Q-LINK's liability for any claim arising from use of the platform is limited to the amount paid for the relevant booking. Q-LINK is not liable for indirect, incidental, or consequential damages." },
    ],
  },
  cookies: {
    title: "Cookie Policy", updated: "January 2025",
    sections: [
      { h: "1. What Are Cookies", p: "Cookies are small text files stored on your device when you visit a website. They help us recognise your browser, remember your preferences, and improve your experience on Q-LINK." },
      { h: "2. Types of Cookies We Use", p: "Essential cookies are required for the platform to function and cannot be disabled. Performance cookies collect anonymised usage statistics. Functional cookies remember your preferences such as language and theme. Marketing cookies track your activity to deliver relevant advertisements." },
      { h: "3. Third-Party Cookies", p: "We use services from Google Analytics, Stripe, and Intercom which may set their own cookies. These third parties have their own privacy policies governing their use of cookie data." },
      { h: "4. Managing Cookies", p: "You can control and delete cookies through your browser settings. Note that disabling essential cookies may affect platform functionality. You can also use our cookie preference centre to manage non-essential cookies." },
      { h: "5. Updates to This Policy", p: "We may update this Cookie Policy periodically. The date of the most recent update is shown at the top of this page. Your continued use of Q-LINK after updates constitutes acceptance." },
    ],
  },
  compliance: {
    title: "Compliance", updated: "January 2025",
    sections: [
      { h: "1. Regulatory Framework", p: "Q-LINK operates in compliance with applicable data protection laws including GDPR (EU), NDPR (Nigeria), PDPA (Kenya), and CCPA (California). We continuously monitor regulatory changes across all jurisdictions where we operate." },
      { h: "2. Anti-Money Laundering (AML)", p: "We maintain AML/KYC procedures for all payment transactions. Service providers are subject to identity verification before approval. Suspicious transactions are reported to relevant financial intelligence units." },
      { h: "3. Provider Verification", p: "All service providers on Q-LINK undergo identity verification, professional credential checks, and background screening where applicable. Approved providers are subject to ongoing performance and compliance monitoring." },
      { h: "4. Dispute Resolution", p: "Q-LINK provides a structured dispute resolution process for booking-related complaints. Unresolved disputes may be escalated to our independent arbitration panel. We are also registered with relevant consumer protection bodies." },
      { h: "5. Accessibility", p: "We are committed to making Q-LINK accessible to all users, including those with disabilities. Our platform targets WCAG 2.1 AA compliance. Please contact accessibility@qlink.app to report issues or request accommodations." },
      { h: "6. Contact Compliance Team", p: "For compliance enquiries, write to compliance@qlink.app." },
    ],
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage({ onSelectRole }: LandingPageProps) {
  const [theme, setTheme]               = useState<ThemeMode>("dark");
  const [view, setView]                 = useState<View>("home");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery]   = useState("");
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [currentProvider, setCurrentProvider]   = useState<string | null>(null);
  const [chatProvider, setChatProvider]         = useState<string | null>(null);
  const [chatServiceName, setChatServiceName]   = useState<string | null>(null);

  // Auth modal
  const [authMode, setAuthMode]   = useState<"login" | "signup">("login");
  const [authRole, setAuthRole]   = useState<UserRole>("customer");
  const [showAuth, setShowAuth]   = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass]   = useState("");
  const [authName, setAuthName]   = useState("");
  const [authCountry, setAuthCountry] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError]     = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Booking state
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [bookAddress, setBookAddress] = useState("");
  const [bookNotes, setBookNotes] = useState("");
  const [bookStep, setBookStep] = useState(1);
  const [bookDone, setBookDone] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ from: "user"|"provider"; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  const highlightRowRef = useRef<HTMLDivElement>(null);

  // Theme tokens
  const isDark = theme === "dark";
  const bg      = isDark ? "#0f172a" : "#f8fafc";
  const card    = isDark ? "#1e293b" : "#ffffff";
  const text    = isDark ? "#e2e8f0" : "#0f172a";
  const muted   = isDark ? "#94a3b8" : "#64748b";
  const border  = isDark ? "#334155" : "#e2e8f0";

  const filteredCards = useMemo(() => allServices.filter(s => {
    const matchFilter = activeFilter === "All" || s.category === activeFilter;
    const matchSearch = [s.name, s.description, s.provider, s.category].join(" ").toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  }), [activeFilter, searchQuery]);

  const scrollHighlights = (dir: "left"|"right") => {
    highlightRowRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  // ── Auth submit ──────────────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(""); setAuthSuccess("");
    if (!authEmail || !authPass) { setAuthError("Email and password are required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) { setAuthError("Enter a valid email address."); return; }
    if (authPass.length < 8) { setAuthError("Password must be at least 8 characters."); return; }
    if (authMode === "signup" && !authName) { setAuthError("Full name is required."); return; }
    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: authEmail, password: authPass,
          options: { data: { name: authName, role: authRole, country: authCountry } },
        });
        if (error) throw error;
        setAuthSuccess("Account created! Check your email to verify, then sign in.");
        setTimeout(() => { setAuthMode("login"); setAuthSuccess(""); }, 2500);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
        if (error) throw error;
        setShowAuth(false);
        onSelectRole(authRole);
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Something went wrong.";
      if (m.includes("rate") || m.includes("429")) setAuthError("Too many attempts. Please wait a moment.");
      else if (m.includes("Invalid login")) setAuthError("Incorrect email or password.");
      else setAuthError(m);
    } finally { setAuthLoading(false); }
  };

  const openAuth = (mode: "login"|"signup", role: UserRole = "customer") => {
    setAuthMode(mode); setAuthRole(role);
    setAuthError(""); setAuthSuccess("");
    setAuthEmail(""); setAuthPass(""); setAuthName(""); setAuthCountry("");
    setShowAuth(true);
  };

  const checkAuthForBooking = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { openAuth("login"); return false; }
    return true;
  };

  // ── Booking ──────────────────────────────────────────────────────────────
  const startBooking = async (serviceId: string) => {
    const ok = await checkAuthForBooking();
    if (!ok) return;
    setCurrentServiceId(serviceId);
    setBookStep(1); setBookDate(""); setBookTime(""); setBookAddress(""); setBookNotes(""); setBookDone(false);
    setView("booking");
  };

  // ── Chat ─────────────────────────────────────────────────────────────────
  const openChat = async (providerName: string, serviceName: string) => {
    const ok = await checkAuthForBooking();
    if (!ok) return;
    setChatProvider(providerName); setChatServiceName(serviceName);
    setChatMessages([{ from: "provider", text: `Hi! I'm with ${providerName}. How can I help you with "${serviceName}" today?`, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }]);
    setChatInput("");
    setView("chat");
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const t = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setChatMessages(prev => [...prev, { from: "user", text: chatInput.trim(), time: t }]);
    const q = chatInput.trim();
    setChatInput("");
    setTimeout(() => {
      setChatMessages(prev => [...prev, { from: "provider", text: `Thanks for your message about "${q}". I'll review your request and get back to you with full details shortly!`, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1200);
  };

  // ── Shared Nav ───────────────────────────────────────────────────────────
  const Nav = ({ title, onBack }: { title?: string; onBack?: () => void }) => (
    <nav style={{ position:"sticky", top:0, zIndex:50, background: isDark ? "rgba(15,23,42,0.95)" : "rgba(248,250,252,0.95)", backdropFilter:"blur(10px)", borderBottom:`1px solid ${border}`, padding:"12px 0" }}>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:24 }}>
        {onBack ? (
          <button onClick={onBack} style={{ fontSize:"1.1rem", background:"none", border:"none", color:"#0ea5e9", cursor:"pointer", padding:0, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>← Back</button>
        ) : (
          <a onClick={() => setView("home")} style={{ fontSize:"1.25rem", fontWeight:700, display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
            <span style={{ width:32, height:32, background:"linear-gradient(135deg,#0ea5e9,#06b6d4)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:"0.9rem" }}>Q</span>
            Q-LINK
          </a>
        )}
        {title && <h1 style={{ margin:0, fontSize:"1.3rem", fontWeight:700 }}>{title}</h1>}
        {!onBack && (
          <div style={{ flex:1, maxWidth:400, display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:card, border:`1px solid ${border}`, borderRadius:8 }}>
            <span style={{ color:muted }}>🔍</span>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search services..." style={{ flex:1, border:"none", background:"transparent", color:text, outline:"none", fontSize:"0.95rem" }} />
          </div>
        )}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => setTheme(isDark ? "light" : "dark")} title="Toggle theme" style={{ width:38, height:38, borderRadius:8, border:`1px solid ${border}`, background:card, color:text, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem" }}>{isDark ? "☀️" : "🌙"}</button>
          {!onBack && <>
            <button onClick={() => openAuth("login")} style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${border}`, background:"transparent", color:text, fontSize:"0.9rem", fontWeight:500 }}>Log in</button>
            <button onClick={() => openAuth("signup")} style={{ padding:"8px 16px", borderRadius:8, border:"none", background:"#0ea5e9", color:"white", fontSize:"0.9rem", fontWeight:600 }}>Sign up</button>
          </>}
        </div>
      </div>
    </nav>
  );

  // ── Footer ───────────────────────────────────────────────────────────────
  const Footer = () => (
    <footer style={{ background: isDark ? "#0f172a" : "#1e293b", color:"white", padding:"48px 24px 24px" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:32, marginBottom:32 }}>
          {[
            { title:"Q-LINK", links:[{ l:"About Q-LINK", fn:()=>{} },{ l:"Careers", fn:()=>{} },{ l:"Press", fn:()=>{} },{ l:"Blog", fn:()=>{} }] },
            { title:"Services", links:[{ l:"Browse Services", fn:()=>{ setView("home"); document.getElementById("services-grid")?.scrollIntoView({behavior:"smooth"}); } },{ l:"Categories", fn:()=>{ setView("home"); document.getElementById("categories-section")?.scrollIntoView({behavior:"smooth"}); } },{ l:"Become a Provider", fn:()=>openAuth("signup","provider") },{ l:"Global Coverage", fn:()=>{} }] },
            { title:"Support", links:[{ l:"Help Center", fn:()=>{} },{ l:"Contact Us", fn:()=>{} },{ l:"FAQs", fn:()=>{} },{ l:"Report Issue", fn:()=>{} }] },
            { title:"Legal", links:[{ l:"Privacy Policy", fn:()=>setView("legal-privacy") },{ l:"Terms of Service", fn:()=>setView("legal-terms") },{ l:"Cookie Policy", fn:()=>setView("legal-cookies") },{ l:"Compliance", fn:()=>setView("legal-compliance") }] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize:"0.95rem", fontWeight:600, marginBottom:12 }}>{col.title}</h4>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:8 }}>
                {col.links.map(link => (
                  <li key={link.l}>
                    <button onClick={link.fn} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.7)", fontSize:"0.9rem", cursor:"pointer", padding:0, textAlign:"left" }}
                      onMouseEnter={e => (e.currentTarget.style.color="white")}
                      onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.7)")}>
                      {link.l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16, fontSize:"0.85rem", color:"rgba(255,255,255,0.6)" }}>
          <div>© 2025 Q-LINK. All rights reserved.</div>
          <div style={{ display:"flex", gap:16 }}>
            {["Twitter","LinkedIn","Instagram"].map(s => (
              <a key={s} href="#" style={{ color:"rgba(255,255,255,0.6)", transition:"color 0.2s" }} onMouseEnter={e=>(e.currentTarget.style.color="white")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.6)")}>{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );

  // ── Auth Modal ───────────────────────────────────────────────────────────
  const AuthModal = () => (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={() => setShowAuth(false)}>
      <div style={{ background:card, border:`1px solid ${border}`, borderRadius:20, padding:"36px 32px", width:"100%", maxWidth:420, position:"relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={() => setShowAuth(false)} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", color:muted, fontSize:20, cursor:"pointer" }}>✕</button>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:800, color:"#0ea5e9", marginBottom:6 }}>Q-LINK</div>
          <h2 style={{ fontSize:18, fontWeight:700, color:text, marginBottom:4 }}>{authMode === "login" ? "Welcome back" : "Create account"}</h2>
          <p style={{ fontSize:13, color:muted }}>{authMode === "login" ? "Sign in to continue" : "Join thousands of users"}</p>
        </div>
        {/* Tab */}
        <div style={{ display:"flex", background: isDark ? "#0f172a" : "#f1f5f9", borderRadius:10, padding:4, marginBottom:16 }}>
          {(["login","signup"] as const).map(m => (
            <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); setAuthSuccess(""); }} style={{ flex:1, padding:"8px", borderRadius:8, border:"none", background: authMode === m ? "#0ea5e9" : "transparent", color: authMode === m ? "white" : muted, fontSize:13, fontWeight:600, cursor:"pointer" }}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>
        {/* Role selector on signup */}
        {authMode === "signup" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
            {([["customer","👤","Customer"],["provider","💼","Provider"]] as [UserRole,string,string][]).map(([r,icon,label]) => (
              <button key={r} onClick={() => setAuthRole(r)} style={{ padding:10, borderRadius:10, border: authRole===r ? "2px solid #0ea5e9" : `1px solid ${border}`, background: authRole===r ? (isDark?"rgba(14,165,233,0.15)":"rgba(14,165,233,0.08)") : "transparent", color:text, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                {icon} {label}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleAuth}>
          {authMode === "signup" && (
            <input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Full name *" style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${border}`, background: isDark?"#0f172a":"#fff", color:text, fontSize:14, marginBottom:10, boxSizing:"border-box" as const, outline:"none" }} />
          )}
          <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="Email address *" style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${border}`, background: isDark?"#0f172a":"#fff", color:text, fontSize:14, marginBottom:10, boxSizing:"border-box" as const, outline:"none" }} />
          <input type="password" value={authPass} onChange={e => setAuthPass(e.target.value)} placeholder={`Password${authMode==="signup"?" (min. 8 chars)":""} *`} style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${border}`, background: isDark?"#0f172a":"#fff", color:text, fontSize:14, marginBottom:10, boxSizing:"border-box" as const, outline:"none" }} />
          {authMode === "signup" && (
            <select value={authCountry} onChange={e => setAuthCountry(e.target.value)} style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${border}`, background: isDark?"#0f172a":"#fff", color: authCountry ? text : muted, fontSize:14, marginBottom:10, boxSizing:"border-box" as const, outline:"none" }}>
              <option value="">Select your country *</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {authError && <div style={{ background:"#fef2f2", color:"#dc2626", padding:"10px 12px", borderRadius:8, fontSize:13, marginBottom:10, border:"1px solid #fecaca" }}>{authError}</div>}
          {authSuccess && <div style={{ background:"#f0fdf4", color:"#16a34a", padding:"10px 12px", borderRadius:8, fontSize:13, marginBottom:10, border:"1px solid #bbf7d0" }}>{authSuccess}</div>}
          <button type="submit" disabled={authLoading} style={{ width:"100%", padding:13, borderRadius:10, border:"none", background:"#0ea5e9", color:"white", fontSize:14, fontWeight:700, cursor: authLoading?"not-allowed":"pointer", opacity: authLoading?0.7:1, marginBottom:10 }}>
            {authLoading ? "…" : authMode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
        <p style={{ textAlign:"center", fontSize:13, color:muted }}>
          {authMode==="login" ? "No account? " : "Have an account? "}
          <button onClick={() => { setAuthMode(authMode==="login"?"signup":"login"); setAuthError(""); setAuthSuccess(""); }} style={{ background:"none", border:"none", color:"#0ea5e9", cursor:"pointer", fontSize:13, fontWeight:600 }}>
            {authMode==="login" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: LEGAL
  // ════════════════════════════════════════════════════════════════════════════
  const legalKey = view.replace("legal-","") as keyof typeof legalContent;
  if (view.startsWith("legal-") && view !== "legal-home") {
    const content = legalContent[legalKey];
    return (
      <div style={{ background:bg, color:text, minHeight:"100vh" }}>
        <style>{`* { box-sizing:border-box; } body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }`}</style>
        <Nav title={content.title} onBack={() => setView("home")} />
        <div style={{ maxWidth:800, margin:"0 auto", padding:"48px 24px" }}>
          <p style={{ fontSize:"0.9rem", color:muted, marginBottom:32 }}>Last updated: {content.updated}</p>
          {content.sections.map(s => (
            <div key={s.h} style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:"1.2rem", fontWeight:700, marginBottom:10 }}>{s.h}</h2>
              <p style={{ fontSize:"1rem", lineHeight:1.8, color:text }}>{s.p}</p>
            </div>
          ))}
          <div style={{ marginTop:48, paddingTop:24, borderTop:`1px solid ${border}` }}>
            <p style={{ color:muted, fontSize:"0.9rem" }}>Questions? Contact us at legal@qlink.app</p>
          </div>
        </div>
        <Footer />
        {showAuth && <AuthModal />}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: SERVICE DETAIL
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "service" && currentServiceId) {
    const service = allServices.find(s => s.id === currentServiceId);
    if (!service) { setView("home"); return null; }
    const related = allServices.filter(s => s.category === service.category && s.id !== service.id).slice(0, 4);
    const prov = providerData[service.provider];

    return (
      <div style={{ background:bg, color:text, minHeight:"100vh" }}>
        <style>{`* { box-sizing:border-box; } body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }`}</style>
        <Nav onBack={() => setView("home")} />

        <div style={{ maxWidth:1280, margin:"0 auto", padding:"40px 24px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:48, alignItems:"start" }}>
            {/* Left */}
            <div>
              <img src={service.image} alt={service.name} style={{ width:"100%", height:360, objectFit:"cover", borderRadius:14, marginBottom:28 }} onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
              {service.badge && <span style={{ background:"#fbbf24", color:"#000", fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20, marginBottom:12, display:"inline-block" }}>{service.badge}</span>}
              <h1 style={{ fontSize:"2rem", fontWeight:700, marginBottom:10 }}>{service.name}</h1>
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16, flexWrap:"wrap" }}>
                <span style={{ color:"#f59e0b" }}>{"★".repeat(Math.floor(service.rating))}{"☆".repeat(5-Math.floor(service.rating))}</span>
                <span style={{ fontSize:13, color:muted }}>{service.rating} · {service.reviews} reviews</span>
                <span style={{ fontSize:13, color:muted }}>📍 {service.location}</span>
                <span style={{ fontSize:13, color:muted }}>⏱ {service.duration}</span>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
                {service.tags.map(t => <span key={t} style={{ background: isDark?"rgba(14,165,233,0.15)":"rgba(14,165,233,0.1)", color:"#0ea5e9", fontSize:12, fontWeight:600, padding:"4px 10px", borderRadius:20 }}>{t}</span>)}
              </div>
              <h2 style={{ fontSize:"1.3rem", fontWeight:600, marginBottom:12 }}>About this service</h2>
              <p style={{ fontSize:"1rem", color:muted, lineHeight:1.8, marginBottom:32 }}>{service.fullDescription}</p>

              {/* Provider preview */}
              {prov && (
                <div style={{ background:card, border:`1px solid ${border}`, borderRadius:14, padding:20, marginBottom:32 }}>
                  <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:12 }}>About the provider</h3>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                    <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#0ea5e9,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:18, flexShrink:0 }}>{service.provider[0]}</div>
                    <div>
                      <div style={{ fontWeight:600 }}>{service.provider}</div>
                      <div style={{ fontSize:12, color:muted }}>Member since {prov.since} · Response: {prov.responseTime}</div>
                    </div>
                  </div>
                  <p style={{ fontSize:13, color:muted, lineHeight:1.7, marginBottom:10 }}>{prov.bio}</p>
                  <button onClick={() => { setCurrentProvider(service.provider); setView("provider"); }} style={{ background:"none", border:"none", color:"#0ea5e9", fontSize:13, fontWeight:600, cursor:"pointer", padding:0 }}>View full profile →</button>
                </div>
              )}

              {/* Related */}
              {related.length > 0 && (
                <>
                  <h3 style={{ fontSize:"1.3rem", fontWeight:600, marginBottom:16 }}>Related Services</h3>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
                    {related.map(r => (
                      <div key={r.id} onClick={() => setCurrentServiceId(r.id)}
                        style={{ background:card, border:`1px solid ${border}`, borderRadius:12, overflow:"hidden", cursor:"pointer", transition:"border-color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor="#0ea5e9"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor=border}>
                        <img src={r.image} alt={r.name} style={{ width:"100%", height:100, objectFit:"cover" }} onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                        <div style={{ padding:"10px 12px" }}>
                          <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{r.name}</div>
                          <div style={{ fontSize:11, color:muted }}>{r.provider}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right sticky sidebar */}
            <div style={{ position:"sticky", top:80 }}>
              <div style={{ background:card, border:`1px solid ${border}`, borderRadius:14, padding:24, marginBottom:16 }}>
                <div style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>{service.price}</div>
                <div style={{ fontSize:13, color:muted, marginBottom:20 }}>{service.duration}</div>
                <button onClick={() => startBooking(service.id)} style={{ width:"100%", padding:13, borderRadius:10, border:"none", background:"#0ea5e9", color:"white", fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:10 }}>
                  Book Now
                </button>
                <button onClick={() => openChat(service.provider, service.name)} style={{ width:"100%", padding:12, borderRadius:10, border:`1px solid ${border}`, background:"transparent", color:text, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  💬 Chat with Provider
                </button>
              </div>
              <div style={{ background:card, border:`1px solid ${border}`, borderRadius:14, padding:18 }}>
                <div style={{ fontSize:12, fontWeight:600, color:muted, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.06em" }}>Provider</div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#0ea5e9,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, flexShrink:0 }}>{service.provider[0]}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600 }}>{service.provider}</div>
                    <div style={{ fontSize:12, color:muted }}>⭐ {service.rating}</div>
                  </div>
                </div>
                <button onClick={() => { setCurrentProvider(service.provider); setView("provider"); }} style={{ width:"100%", padding:"9px", borderRadius:8, border:`1px solid ${border}`, background:"transparent", color:"#0ea5e9", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
        {showAuth && <AuthModal />}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: PROVIDER PROFILE
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "provider" && currentProvider) {
    const prov = providerData[currentProvider];
    const services = allServices.filter(s => s.provider === currentProvider);
    const avgRating = services.length ? (services.reduce((a,b) => a+b.rating, 0) / services.length).toFixed(1) : "N/A";
    const totalReviews = services.reduce((a,b) => a+b.reviews, 0);

    return (
      <div style={{ background:bg, color:text, minHeight:"100vh" }}>
        <style>{`* { box-sizing:border-box; } body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }`}</style>
        <Nav onBack={() => setView(currentServiceId ? "service" : "home")} />

        <div style={{ maxWidth:1280, margin:"0 auto", padding:"40px 24px" }}>
          {/* Header card */}
          <div style={{ background:card, border:`1px solid ${border}`, borderRadius:18, padding:"36px 40px", marginBottom:32, display:"flex", gap:28, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ width:90, height:90, borderRadius:"50%", background:"linear-gradient(135deg,#0ea5e9,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:34, flexShrink:0 }}>
              {currentProvider[0]}
            </div>
            <div style={{ flex:1 }}>
              <h1 style={{ fontSize:"1.8rem", fontWeight:700, marginBottom:4 }}>{currentProvider}</h1>
              <p style={{ fontSize:14, color:muted, marginBottom:14 }}>{prov?.bio || "Service provider on Q-LINK"}</p>
              <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                {[["⭐ "+avgRating,"Rating"],[(totalReviews).toString(),"Reviews"],[services.length.toString(),"Services"],[prov?.since||"2020","Member since"]].map(([v,l]) => (
                  <div key={l} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:700 }}>{v}</div>
                    <div style={{ fontSize:11, color:muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <span style={{ background:"#10b981", color:"white", fontSize:11, fontWeight:700, padding:"6px 14px", borderRadius:20, flexShrink:0 }}>✓ Verified</span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:28, alignItems:"start" }}>
            <div>
              <h2 style={{ fontSize:"1.3rem", fontWeight:700, marginBottom:16 }}>Services Offered</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16, marginBottom:36 }}>
                {services.map(s => (
                  <div key={s.id} onClick={() => { setCurrentServiceId(s.id); setView("service"); }}
                    style={{ background:card, border:`1px solid ${border}`, borderRadius:14, overflow:"hidden", cursor:"pointer", transition:"border-color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor="#0ea5e9"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor=border}>
                    <img src={s.image} alt={s.name} style={{ width:"100%", height:130, objectFit:"cover" }} onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                    <div style={{ padding:"14px 16px" }}>
                      <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{s.name}</div>
                      <div style={{ fontSize:12, color:muted, marginBottom:8 }}>{s.price}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ color:"#f59e0b", fontSize:12 }}>{"★".repeat(Math.floor(s.rating))}</span>
                        <button onClick={e => { e.stopPropagation(); startBooking(s.id); }} style={{ padding:"5px 12px", borderRadius:8, border:"none", background:"#0ea5e9", color:"white", fontSize:12, fontWeight:600, cursor:"pointer" }}>Book</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {prov?.reviews && (
                <>
                  <h2 style={{ fontSize:"1.3rem", fontWeight:700, marginBottom:16 }}>Reviews</h2>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {prov.reviews.map(r => (
                      <div key={r.name} style={{ background:card, border:`1px solid ${border}`, borderRadius:14, padding:"18px 20px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:"50%", background:"#0ea5e9", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13 }}>{r.name[0]}</div>
                            <div>
                              <div style={{ fontSize:14, fontWeight:600 }}>{r.name}</div>
                              <div style={{ fontSize:11, color:muted }}>{r.date}</div>
                            </div>
                          </div>
                          <span style={{ color:"#f59e0b" }}>{"★".repeat(r.rating)}</span>
                        </div>
                        <p style={{ fontSize:14, color:muted, margin:0, lineHeight:1.6 }}>{r.text}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ position:"sticky", top:80 }}>
              <div style={{ background:card, border:`1px solid ${border}`, borderRadius:14, padding:20 }}>
                <h3 style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Provider Info</h3>
                {[["Response time", prov?.responseTime||"< 2 hours"],["Languages", prov?.languages||"English"],["Member since", prov?.since||"2020"],["Services", services.length.toString()]].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                    <span style={{ color:muted }}>{k}</span>
                    <span style={{ fontWeight:500 }}>{v}</span>
                  </div>
                ))}
                <button onClick={() => { const s = services[0]; if (s) { setCurrentServiceId(s.id); startBooking(s.id); } }} style={{ width:"100%", marginTop:16, padding:"11px", borderRadius:10, border:"none", background:"#0ea5e9", color:"white", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  Book a Service
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
        {showAuth && <AuthModal />}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: BOOKING FLOW
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "booking" && currentServiceId) {
    const service = allServices.find(s => s.id === currentServiceId);
    if (!service) { setView("home"); return null; }
    const today = new Date().toISOString().split("T")[0];
    const times = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

    return (
      <div style={{ background:bg, color:text, minHeight:"100vh" }}>
        <style>{`* { box-sizing:border-box; } body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }`}</style>
        <Nav onBack={() => setView("service")} />

        <div style={{ maxWidth:620, margin:"0 auto", padding:"40px 24px" }}>
          <h1 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:4 }}>Book Service</h1>
          <p style={{ fontSize:14, color:muted, marginBottom:28 }}>{service.name} · {service.provider}</p>

          {/* Progress */}
          <div style={{ display:"flex", gap:8, marginBottom:32 }}>
            {["Select Time","Your Details","Confirmed"].map((label,i) => (
              <div key={label} style={{ flex:1, textAlign:"center" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", margin:"0 auto 6px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, background: bookDone||bookStep>i+1 ? "#10b981" : bookStep===i+1 ? "#0ea5e9" : card, border:`2px solid ${bookDone||bookStep>i+1?"#10b981":bookStep===i+1?"#0ea5e9":border}`, color: bookStep>=i+1||bookDone ? "white" : muted }}>
                  {bookDone || bookStep > i+1 ? "✓" : i+1}
                </div>
                <div style={{ fontSize:11, color: bookStep===i+1 ? "#0ea5e9" : muted }}>{label}</div>
              </div>
            ))}
          </div>

          {!bookDone && bookStep === 1 && (
            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:14, padding:24 }}>
              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:8 }}>Select date</label>
                <input type="date" min={today} value={bookDate} onChange={e => setBookDate(e.target.value)} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${border}`, background:"transparent", color:text, fontSize:14, outline:"none" }} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:8 }}>Select time</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  {times.map(t => (
                    <button key={t} onClick={() => setBookTime(t)} style={{ padding:10, borderRadius:10, border:`1px solid ${bookTime===t?"#0ea5e9":border}`, background: bookTime===t?"rgba(14,165,233,0.15)":"transparent", color: bookTime===t?"#0ea5e9":text, fontSize:13, fontWeight:500, cursor:"pointer" }}>{t}</button>
                  ))}
                </div>
              </div>
              <button disabled={!bookDate||!bookTime} onClick={() => setBookStep(2)} style={{ width:"100%", padding:13, borderRadius:10, border:"none", background: bookDate&&bookTime?"#0ea5e9":"#334155", color:"white", fontSize:14, fontWeight:700, cursor: bookDate&&bookTime?"pointer":"not-allowed" }}>Continue →</button>
            </div>
          )}

          {!bookDone && bookStep === 2 && (
            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:14, padding:24 }}>
              <div style={{ background: isDark?"rgba(14,165,233,0.08)":"rgba(14,165,233,0.05)", borderRadius:10, padding:"12px 16px", marginBottom:18, fontSize:13 }}>
                📅 {bookDate} at {bookTime} · {service.price}
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:8 }}>Service address *</label>
                <input value={bookAddress} onChange={e => setBookAddress(e.target.value)} placeholder="Enter your full address" style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${border}`, background:"transparent", color:text, fontSize:14, outline:"none" }} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:8 }}>Notes (optional)</label>
                <textarea value={bookNotes} onChange={e => setBookNotes(e.target.value)} placeholder="Any special instructions?" rows={3} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${border}`, background:"transparent", color:text, fontSize:14, resize:"none", outline:"none" }} />
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setBookStep(1)} style={{ flex:1, padding:12, borderRadius:10, border:`1px solid ${border}`, background:"transparent", color:text, fontSize:14, fontWeight:600, cursor:"pointer" }}>← Back</button>
                <button disabled={!bookAddress} onClick={() => { setBookDone(true); setBookStep(3); }} style={{ flex:2, padding:12, borderRadius:10, border:"none", background: bookAddress?"#0ea5e9":"#334155", color:"white", fontSize:14, fontWeight:700, cursor: bookAddress?"pointer":"not-allowed" }}>Confirm Booking</button>
              </div>
            </div>
          )}

          {bookDone && (
            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:14, padding:40, textAlign:"center" }}>
              <div style={{ fontSize:52, marginBottom:16 }}>✅</div>
              <h2 style={{ fontSize:"1.4rem", fontWeight:700, marginBottom:8 }}>Booking Confirmed!</h2>
              <p style={{ fontSize:14, color:muted, marginBottom:24 }}>Your booking for <strong>{service.name}</strong> on {bookDate} at {bookTime} has been submitted. {service.provider} will confirm within 24 hours.</p>
              <button onClick={() => { setView("home"); setBookDone(false); }} style={{ padding:"12px 28px", borderRadius:10, border:"none", background:"#0ea5e9", color:"white", fontSize:14, fontWeight:600, cursor:"pointer" }}>Browse More Services</button>
            </div>
          )}
        </div>

        <Footer />
        {showAuth && <AuthModal />}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: CHAT
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "chat" && chatProvider) {
    return (
      <div style={{ background:bg, color:text, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <style>{`* { box-sizing:border-box; } body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }`}</style>
        {/* Chat header */}
        <div style={{ background:card, borderBottom:`1px solid ${border}`, padding:"14px 24px", display:"flex", alignItems:"center", gap:14, position:"sticky", top:0, zIndex:50 }}>
          <button onClick={() => setView(currentServiceId ? "service" : "home")} style={{ background:"none", border:"none", color:"#0ea5e9", cursor:"pointer", fontSize:"1.1rem", fontWeight:600, padding:0 }}>←</button>
          <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#0ea5e9,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:16, flexShrink:0 }}>{chatProvider[0]}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{chatProvider}</div>
            <div style={{ fontSize:12, color:muted }}>{chatServiceName}</div>
          </div>
          <div style={{ width:10, height:10, borderRadius:"50%", background:"#10b981" }} title="Online" />
        </div>
        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:24, display:"flex", flexDirection:"column", gap:14, maxWidth:720, width:"100%", margin:"0 auto" }}>
          {chatMessages.map((m,i) => (
            <div key={i} style={{ display:"flex", justifyContent: m.from==="user"?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"70%", background: m.from==="user"?"#0ea5e9":card, color: m.from==="user"?"white":text, padding:"10px 14px", borderRadius: m.from==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", border: m.from==="provider"?`1px solid ${border}`:"none", fontSize:14, lineHeight:1.5 }}>
                <p style={{ margin:"0 0 4px" }}>{m.text}</p>
                <p style={{ margin:0, fontSize:11, opacity:0.6 }}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Input */}
        <div style={{ background:card, borderTop:`1px solid ${border}`, padding:"14px 24px", display:"flex", gap:10, maxWidth:720, width:"100%", margin:"0 auto", boxSizing:"border-box" as const }}>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==="Enter" && sendChat()} placeholder="Type a message..." style={{ flex:1, padding:"10px 14px", borderRadius:24, border:`1px solid ${border}`, background:"transparent", color:text, fontSize:14, outline:"none" }} />
          <button onClick={sendChat} style={{ padding:"10px 20px", borderRadius:24, border:"none", background:"#0ea5e9", color:"white", fontWeight:700, cursor:"pointer", fontSize:14 }}>Send</button>
        </div>
        {showAuth && <AuthModal />}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW: HOME (main landing page)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ background:bg, color:text, transition:"all 0.3s ease" }}>
      <style>{`* { box-sizing:border-box; } html { scroll-behavior:smooth; } body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto',sans-serif; } a { color:inherit; text-decoration:none; } button { font:inherit; cursor:pointer; } input { font:inherit; }`}</style>
      <Nav />

      {/* ── HERO ── */}
      <section style={{ padding:"48px 24px", background: isDark?"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)":"linear-gradient(135deg,#f8fafc 0%,#e0f2fe 100%)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
          <div>
            <div style={{ fontSize:"0.85rem", fontWeight:600, color:"#0ea5e9", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:12 }}>Trusted by 120,000+ users worldwide</div>
            <h1 style={{ fontSize:"clamp(2rem,4vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:16 }}>Find trusted<br />services faster</h1>
            <p style={{ fontSize:"1.05rem", color:muted, lineHeight:1.7, marginBottom:32, maxWidth:"48ch" }}>
              Discover expert support across 8+ categories. Compare providers, read reviews, and book with confidence — all in one unified platform.
            </p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <button onClick={() => document.getElementById("services-grid")?.scrollIntoView({ behavior:"smooth" })} style={{ padding:"12px 28px", borderRadius:8, border:"none", background:"#0ea5e9", color:"white", fontSize:"1rem", fontWeight:600, boxShadow:"0 4px 16px rgba(14,165,233,0.35)" }}>
                Explore Services
              </button>
              <button onClick={() => openAuth("signup")} style={{ padding:"12px 28px", borderRadius:8, border:`1px solid ${border}`, background:"transparent", color:text, fontSize:"1rem", fontWeight:600 }}>
                Sign Up Free
              </button>
            </div>
            <div style={{ display:"flex", gap:28, marginTop:36, flexWrap:"wrap" }}>
              {[["120K+","Bookings"],["2,400+","Providers"],["60+","Countries"]].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontSize:22, fontWeight:800 }}>{v}</div>
                  <div style={{ fontSize:11, color:muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Hero image with floating cards */}
          <div style={{ position:"relative", borderRadius:16, overflow:"hidden", minHeight:380 }}>
            <img src="/assets/hRM4Ajo6It08.jpg" alt="Hero — services" style={{ width:"100%", height:420, objectFit:"cover", display:"block" }} onError={e => { (e.target as HTMLImageElement).src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80"; }} />
            {/* Floating preview cards */}
            <div style={{ position:"absolute", bottom:16, left:12, right:12, display:"flex", gap:8 }}>
              {allServices.slice(0,2).map(s => (
                <div key={s.id} onClick={() => { setCurrentServiceId(s.id); setView("service"); }} style={{ flex:1, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", borderRadius:12, padding:"10px 14px", cursor:"pointer" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"white", marginBottom:2 }}>{s.name}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>{s.provider}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories-section" style={{ padding:"48px 24px", borderBottom:`1px solid ${border}` }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <h2 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:28 }}>Browse by Category</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:14 }}>
            {categories.map(cat => (
              <div key={cat.id} onClick={() => { setActiveFilter(cat.name); document.getElementById("services-grid")?.scrollIntoView({ behavior:"smooth" }); }}
                style={{ background:card, border:`1px solid ${border}`, borderRadius:14, textAlign:"center", cursor:"pointer", overflow:"hidden", transition:"all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#0ea5e9"; (e.currentTarget as HTMLElement).style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor=border; (e.currentTarget as HTMLElement).style.transform="translateY(0)"; }}>
                <img src={cat.img} alt={cat.name} style={{ width:"100%", height:70, objectFit:"cover", display:"block" }} onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                <div style={{ padding:"10px 8px", fontSize:"0.88rem", fontWeight:600 }}>{cat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLASH HIGHLIGHTS ── */}
      <section style={{ padding:"48px 24px", borderBottom:`1px solid ${border}` }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
            <div>
              <h2 style={{ fontSize:"1.5rem", fontWeight:700, margin:"0 0 8px" }}>⚡ Flash Highlights</h2>
              <p style={{ color:muted, margin:0, fontSize:"0.95rem" }}>Time-sensitive service opportunities</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {(["left","right"] as const).map(dir => (
                <button key={dir} onClick={() => scrollHighlights(dir)} style={{ width:40, height:40, borderRadius:8, border:`1px solid ${border}`, background:card, color:text, display:"flex", alignItems:"center", justifyContent:"center" }}>{dir==="left"?"←":"→"}</button>
              ))}
            </div>
          </div>
          <div ref={highlightRowRef} style={{ display:"grid", gridAutoFlow:"column", gridAutoColumns:"minmax(280px,1fr)", gap:16, overflowX:"auto", paddingBottom:8, scrollBehavior:"smooth" }}>
            {allServices.slice(0,4).map(service => (
              <div key={service.id} onClick={() => { setCurrentServiceId(service.id); setView("service"); }}
                style={{ background:card, border:`1px solid ${border}`, borderRadius:14, overflow:"hidden", cursor:"pointer", transition:"all 0.2s", display:"flex", flexDirection:"column" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#0ea5e9"; (e.currentTarget as HTMLElement).style.transform="translateY(-4px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor=border; (e.currentTarget as HTMLElement).style.transform="translateY(0)"; }}>
                <img src={service.image} alt={service.name} style={{ width:"100%", height:180, objectFit:"cover" }} onError={e => { (e.target as HTMLImageElement).src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80"; }} />
                <div style={{ padding:16, flex:1 }}>
                  {service.badge && <span style={{ background:"#fbbf24", color:"#000", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20, marginBottom:8, display:"inline-block" }}>{service.badge}</span>}
                  <h3 style={{ fontSize:"1rem", fontWeight:600, margin:"0 0 6px" }}>{service.name}</h3>
                  <p style={{ fontSize:"0.85rem", color:muted, margin:"0 0 10px", lineHeight:1.5, flex:1 }}>{service.description}</p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:"0.85rem", color:muted }}>
                    <span>{service.provider}</span>
                    <span style={{ color:"#0ea5e9", fontWeight:600 }}>View →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN SERVICES GRID ── */}
      <section id="services-grid" style={{ padding:"48px 24px", borderBottom:`1px solid ${border}` }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:16 }}>Today's For You</h2>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["All","Business","Home Care","Health","Beauty","Education","Travel","Repair"].map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${border}`, background: activeFilter===f?"#0ea5e9":card, color: activeFilter===f?"white":text, fontSize:"0.9rem", fontWeight:500, transition:"all 0.2s" }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
            {filteredCards.length > 0 ? filteredCards.map(c => (
              <div key={c.id} onClick={() => { setCurrentServiceId(c.id); setView("service"); }}
                style={{ background:card, border:`1px solid ${border}`, borderRadius:14, overflow:"hidden", cursor:"pointer", transition:"all 0.2s", display:"flex", flexDirection:"column" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#0ea5e9"; (e.currentTarget as HTMLElement).style.boxShadow=isDark?"0 8px 24px rgba(14,165,233,0.15)":"0 8px 24px rgba(14,165,233,0.1)"; (e.currentTarget as HTMLElement).style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor=border; (e.currentTarget as HTMLElement).style.boxShadow="none"; (e.currentTarget as HTMLElement).style.transform="translateY(0)"; }}>
                <img src={c.image} alt={c.name} style={{ width:"100%", height:160, objectFit:"cover" }} onError={e => { (e.target as HTMLImageElement).src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80"; }} />
                <div style={{ padding:"14px 16px", flex:1, display:"flex", flexDirection:"column" }}>
                  <span style={{ fontSize:"0.75rem", fontWeight:600, background: isDark?"rgba(14,165,233,0.2)":"rgba(14,165,233,0.1)", color:"#0ea5e9", padding:"4px 8px", borderRadius:4, marginBottom:8, width:"fit-content" }}>{c.category}</span>
                  <h3 style={{ fontSize:"1rem", fontWeight:600, margin:"0 0 6px" }}>{c.name}</h3>
                  <p style={{ fontSize:"0.85rem", color:muted, margin:"0 0 10px", flex:1, lineHeight:1.5 }}>{c.description}</p>
                  <div style={{ fontSize:"0.82rem", color:muted, marginBottom:8 }}>{c.provider}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:13 }}><span style={{ color:"#f59e0b" }}>{"★".repeat(Math.floor(c.rating))}</span> <span style={{ color:muted }}>{c.rating} ({c.reviews})</span></span>
                    <span style={{ color:"#0ea5e9", fontWeight:600, fontSize:13 }}>View Details →</span>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"48px 24px", color:muted }}>
                <div style={{ fontSize:"2rem", marginBottom:12 }}>🔍</div>
                <p>No services found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURED MIXED LAYOUT ── */}
      <section style={{ padding:"48px 24px", borderBottom:`1px solid ${border}` }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <h2 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:24 }}>Featured Providers</h2>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:18 }}>
            {/* Large left card */}
            <div onClick={() => { setCurrentServiceId(allServices[0].id); setView("service"); }}
              style={{ background:card, border:`1px solid ${border}`, borderRadius:16, overflow:"hidden", cursor:"pointer", transition:"transform 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform="translateY(-2px)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform="translateY(0)"}>
              <img src={allServices[0].image} alt={allServices[0].name} style={{ width:"100%", height:260, objectFit:"cover" }} onError={e => { (e.target as HTMLImageElement).src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"; }} />
              <div style={{ padding:20 }}>
                <h3 style={{ fontSize:"1.2rem", fontWeight:700, marginBottom:6 }}>{allServices[0].name}</h3>
                <p style={{ fontSize:14, color:muted, marginBottom:12 }}>{allServices[0].description}</p>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, color:"#f59e0b" }}>{"★".repeat(Math.floor(allServices[0].rating))} <span style={{ color:muted }}>{allServices[0].rating}</span></span>
                  <button onClick={e => { e.stopPropagation(); startBooking(allServices[0].id); }} style={{ padding:"8px 18px", borderRadius:8, border:"none", background:"#0ea5e9", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>Book Now</button>
                </div>
              </div>
            </div>
            {/* Right stack */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {allServices.slice(1,4).map(s => (
                <div key={s.id} onClick={() => { setCurrentServiceId(s.id); setView("service"); }}
                  style={{ background:card, border:`1px solid ${border}`, borderRadius:14, overflow:"hidden", display:"flex", cursor:"pointer", transition:"border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor="#0ea5e9"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor=border}>
                  <img src={s.image} alt={s.name} style={{ width:80, height:80, objectFit:"cover", flexShrink:0 }} onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                  <div style={{ padding:"10px 12px", flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{s.name}</div>
                    <div style={{ fontSize:11, color:muted, marginBottom:4 }}>{s.provider}</div>
                    <span style={{ color:"#f59e0b", fontSize:12 }}>{"★".repeat(Math.floor(s.rating))}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:"64px 24px", background: isDark?"linear-gradient(135deg,#1e293b 0%,#0f172a 100%)":"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", color:"white", textAlign:"center", borderBottom:`1px solid ${border}` }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <h2 style={{ fontSize:"clamp(1.5rem,3vw,2.5rem)", fontWeight:700, marginBottom:14, maxWidth:"22ch", margin:"0 auto 14px" }}>"Discover Services Beyond Boundaries"</h2>
          <p style={{ fontSize:"1.05rem", color:"rgba(255,255,255,0.8)", maxWidth:"55ch", margin:"0 auto 28px", lineHeight:1.7 }}>Q-LINK connects you with trusted service providers across 8+ categories and multiple countries. Find the right expert for any need.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => openAuth("signup")} style={{ padding:"13px 32px", borderRadius:8, border:"none", background:"#0ea5e9", color:"white", fontSize:"1rem", fontWeight:600, boxShadow:"0 4px 20px rgba(14,165,233,0.4)" }}>Start Exploring</button>
            <button onClick={() => openAuth("signup","provider")} style={{ padding:"13px 28px", borderRadius:8, border:"2px solid rgba(255,255,255,0.3)", background:"rgba(255,255,255,0.08)", color:"white", fontSize:"1rem", fontWeight:600 }}>Become a Provider</button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Auth modal */}
      {showAuth && <AuthModal />}
    </div>
  );
}
