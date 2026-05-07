# LinkedInFlow Frontend - Software Documentation

---

## CHAPTER 1: INTRODUCTION

### 1.1 Company Profile

**LinkedInFlow** is a LinkedIn automation SaaS (Software as a Service) platform designed to streamline social media content management. The platform enables users to effortlessly create, schedule, and publish LinkedIn posts through an intuitive web interface.

**Mission:** Empower professionals and businesses to maintain consistent LinkedIn presence with minimal effort.

**Target Users:**
- Marketing professionals
- Content creators
- Social media managers
- Business owners
- LinkedIn influencers

---

### 1.2 Existing System and Need for the System

**Existing Problems:**
- Manual LinkedIn post creation is time-consuming
- Lack of scheduling functionality
- No centralized content management system
- Difficulty tracking post performance
- No content vault for storing LinkedIn credentials securely
- Limited automation capabilities

**Need for LinkedInFlow:**
- Provide a unified platform for content management
- Enable post scheduling for optimal engagement times
- Secure OAuth-based LinkedIn authentication
- Real-time analytics and performance tracking
- Bulk import and batch processing capabilities
- Automated content calendar management

---

### 1.3 Scope of Work

**In Scope:**
- User authentication and authorization (OAuth + session management)
- Post creation with multiple media types (text, image, link)
- Scheduling posts for future publication
- Publishing posts immediately or as drafts
- Post management (view, edit, delete, publish)
- Analytics dashboard with performance metrics
- LinkedIn account management (connect/disconnect)
- Settings and user preferences
- Admin capabilities for LinkedIn vault management

**Out of Scope:**
- Direct LinkedIn API integration (delegated to backend)
- Social media platforms other than LinkedIn
- Advanced AI-powered content generation
- Team collaboration features (future phase)

---

### 1.4 Operating Environment - Hardware and Software

**Client-Side Requirements:**

| Component | Requirement |
|-----------|-------------|
| **OS** | Windows 11, macOS 12+, Linux (Ubuntu 20.04+) |
| **Browser** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| **RAM** | Minimum 2GB |
| **Internet** | Minimum 5 Mbps |

**Development Environment:**

| Tool | Version |
|------|---------|
| **Node.js** | 18.x or higher |
| **pnpm** | 8.x or higher |
| **VS Code** | Latest |
| **TypeScript** | 5.x |

**Server-Side:**
- Fastify backend on `localhost:4000` (development)
- Session-based authentication with Bearer tokens
- PostgreSQL database (backend responsibility)

---

### 1.5 Detail Description of the Technology Used

**Frontend Stack:**

```
React 18 + TypeScript + Vite
├── UI Framework: shadcn/ui (Radix UI primitives + Tailwind CSS)
├── State Management: Zustand
├── HTTP Client: Axios (with credentials)
├── Form Handling: react-hook-form + zod validation
├── Charts & Analytics: recharts
├── Notifications: sonner
├── CSS: Tailwind CSS (utility-first)
└── Build Tool: Vite (HMR, optimized builds)
```

**Key Technologies:**

| Technology | Purpose |
|-----------|---------|
| **React 18** | Component-based UI framework |
| **TypeScript** | Type-safe development |
| **Vite** | Lightning-fast dev server & bundler |
| **Zustand** | Lightweight state management |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | Reusable component library |
| **Axios** | HTTP requests with interceptors |
| **react-hook-form** | Efficient form management |
| **zod** | Runtime schema validation |
| **recharts** | Data visualization & charts |
| **sonner** | Toast notifications |

---

## CHAPTER 2: SOFTWARE REQUIREMENT SPECIFICATION AND PROPOSED SYSTEM

### 2.1 Proposed System

LinkedInFlow is a web-based SaaS platform that provides a comprehensive solution for LinkedIn content management. Users authenticate via LinkedIn OAuth, connect their LinkedIn accounts, and gain access to a full suite of post creation and scheduling tools.

**Core Features:**
- Dashboard with quick statistics
- Multi-type post creation (text, image, link)
- Post scheduling with date/time picker
- Post management interface (all/draft/scheduled/published/failed)
- Real-time analytics
- LinkedIn credential vault
- Automation rules and triggers
- Batch processing
- Content calendar

---

### 2.2 Objectives of System

**Primary Objectives:**

1. **Streamline Content Creation**
   - Simplify post creation workflow
   - Support multiple media types
   - Provide content templates

2. **Enable Scheduling & Automation**
   - Schedule posts for optimal times
   - Automate recurring posts
   - Batch process multiple posts

3. **Provide Analytics & Insights**
   - Track post performance
   - Display engagement metrics
   - Monitor LinkedIn analytics

4. **Secure Authentication**
   - OAuth 2.0 integration with LinkedIn
   - Session-based security
   - Credential vault management

5. **User-Friendly Interface**
   - Intuitive navigation
   - Responsive design
   - Accessible components

---

### 2.3 Overall Description

#### 2.3.1 User Requirements

**Functional Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | User shall be able to sign up and create account | Critical |
| FR-2 | User shall be able to sign in with credentials | Critical |
| FR-3 | User shall be able to authenticate via LinkedIn OAuth | Critical |
| FR-4 | User shall be able to connect/disconnect LinkedIn account | High |
| FR-5 | User shall be able to create text posts | Critical |
| FR-6 | User shall be able to create posts with images | High |
| FR-7 | User shall be able to create posts with links | High |
| FR-8 | User shall be able to save posts as drafts | Critical |
| FR-9 | User shall be able to publish posts immediately | Critical |
| FR-10 | User shall be able to schedule posts | Critical |
| FR-11 | User shall be able to view all posts | High |
| FR-12 | User shall be able to filter posts by status | High |
| FR-13 | User shall be able to edit draft posts | High |
| FR-14 | User shall be able to delete posts | High |
| FR-15 | User shall be able to view analytics dashboard | High |
| FR-16 | User shall be able to view post-level analytics | Medium |
| FR-17 | User shall be able to manage LinkedIn vault | Medium |
| FR-18 | User shall be able to set automation rules | Medium |
| FR-19 | User shall be able to batch import posts | Medium |
| FR-20 | User shall be able to view content calendar | Medium |

#### 2.3.2 Specific Requirements

**Data Requirements:**
- Store user credentials securely
- Maintain post history with metadata
- Track performance metrics
- Store LinkedIn token information
- Preserve scheduling history

**Performance Requirements:**
- Page load time < 2 seconds
- API response time < 500ms
- Support 1000+ concurrent users
- Handle 10,000+ posts in database

**Security Requirements:**
- HTTPS encryption in transit
- Secure OAuth implementation
- Session token expiration
- CSRF protection
- XSS prevention
- Secure credential storage

#### 2.3.3 Other Non-functional Requirements

**Usability:**
- Accessibility (WCAG 2.1 Level AA)
- Mobile-responsive design
- Dark mode support
- Intuitive navigation

**Reliability:**
- 99.5% uptime SLA
- Data backup and recovery
- Error handling and logging
- Graceful degradation

**Maintainability:**
- Clean code architecture
- TypeScript for type safety
- Component-based design
- Comprehensive documentation
- Unit and integration tests

**Scalability:**
- Horizontal scaling capability
- Load balancing ready
- CDN integration ready
- Database query optimization

---

## CHAPTER 3: ANALYSIS & DESIGN

### 3.1 System Flow Diagram (Context Level Diagram)

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ├─→ Browser (React App)
       │
       ├─→ LinkedIn OAuth Server
       │
       └─→ Fastify Backend
            │
            ├─→ Database (PostgreSQL)
            ├─→ LinkedIn API
            └─→ Session Store
```

**System Context:**
- User interacts with React frontend
- Frontend communicates with Fastify backend
- Backend manages database and LinkedIn API integration
- OAuth flow handled between frontend and LinkedIn

---

### 3.2 Object Diagram (Domain Model)

```
User
├── id: string
├── email: string
├── username: string
├── password_hash: string
├── created_at: timestamp
└── updated_at: timestamp

LinkedInAccount
├── id: string
├── user_id: string (FK)
├── access_token: string
├── refresh_token: string
├── expires_at: timestamp
└── connected_at: timestamp

Post
├── id: string
├── user_id: string (FK)
├── content: string
├── post_type: 'text' | 'image' | 'link'
├── link_url?: string
├── media_url?: string
├── status: 'draft' | 'published' | 'scheduled' | 'failed'
├── scheduled_at?: timestamp
├── published_at?: timestamp
├── created_at: timestamp
└── updated_at: timestamp

Analytics
├── id: string
├── post_id: string (FK)
├── impressions: number
├── likes: number
├── comments: number
├── shares: number
├── fetched_at: timestamp
└── updated_at: timestamp
```

---

### 3.3 List of Classes & Class Diagram

**TypeScript Interfaces:**

```typescript
// Authentication
interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  checkAuth(): Promise<void>;
  logout(): Promise<void>;
}

// LinkedIn
interface LinkedInToken {
  id: string;
  user_id: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  created_at: string;
}

interface LinkedInStatus {
  connected: boolean;
  account_name?: string;
  profile_url?: string;
}

// Posts
interface Post {
  id: string;
  user_id: string;
  content: string;
  post_type: 'text' | 'image' | 'link';
  link_url?: string;
  status: 'draft' | 'published' | 'failed' | 'scheduled';
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface PostMetrics {
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
}

// API Responses
interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

**Store Classes (Zustand):**

```
useAuthStore
├── user: User | null
├── isAuthenticated: boolean
├── checkAuth(): Promise<void>
├── logout(): Promise<void>
└── setUser(user: User): void

useLinkedInStore
├── posts: Post[]
├── linkedInStatus: LinkedInStatus
├── setPosts(posts: Post[]): void
├── removePost(id: string): void
└── updatePost(post: Post): void

useDataStore
├── analytics: Map<string, PostMetrics>
├── calendar: Map<string, Post[]>
├── setAnalytics(postId: string, metrics: PostMetrics): void
└── setCalendarData(data: Map<string, Post[]>): void
```

---

### 3.4 List of Use Cases & Use Case Diagram

**Primary Use Cases:**

```
┌─────────────────────────────────────┐
│         System Boundary             │
│    LinkedInFlow Frontend             │
│                                       │
│  UC-1: User Registration             │
│  UC-2: User Login                    │
│  UC-3: Connect LinkedIn Account      │
│  UC-4: Create Post                   │
│  UC-5: Schedule Post                 │
│  UC-6: Publish Post                  │
│  UC-7: View Posts                    │
│  UC-8: Delete Post                   │
│  UC-9: View Analytics                │
│  UC-10: Manage LinkedIn Vault        │
│  UC-11: View Content Calendar        │
│  UC-12: Configure Automation         │
│                                       │
└─────────────────────────────────────┘
            ↑
            │ Actors
            │
    ┌───────┴────────┐
    │                │
┌───────┐       ┌──────────┐
│ User  │       │LinkedIn  │
│       │       │API       │
└───────┘       └──────────┘
```

**Use Case Descriptions:**

| UC-ID | Use Case | Actor | Description |
|-------|----------|-------|-------------|
| UC-1 | User Registration | User | User creates account with email, username, password |
| UC-2 | User Login | User | User logs in with credentials |
| UC-3 | Connect LinkedIn | User | User connects LinkedIn account via OAuth |
| UC-4 | Create Post | User | User creates new post (text/image/link) |
| UC-5 | Schedule Post | User | User schedules post for future date/time |
| UC-6 | Publish Post | User | User publishes post immediately |
| UC-7 | View Posts | User | User views all posts with filters |
| UC-8 | Delete Post | User | User deletes draft or scheduled post |
| UC-9 | View Analytics | User | User views dashboard and post analytics |
| UC-10 | Manage Vault | User | User manages LinkedIn credentials |
| UC-11 | View Calendar | User | User views content calendar |
| UC-12 | Set Automation | User | User creates automation rules |

---

### 3.5 Sequence Diagram

**Post Creation & Publishing Flow:**

```
User    →   Frontend   →   Backend   →   Database
  │           │            │           │
  │─Create────→│            │           │
  │           │            │           │
  │           │─POST /api/posts─→      │
  │           │            │           │
  │           │            │─INSERT───→│
  │           │            │           │
  │           │←────Response────       │
  │           │            │           │
  │←─Success──│            │           │
  │           │            │           │
  │─Schedule──→│            │           │
  │           │            │           │
  │           │─PATCH /posts/:id─→     │
  │           │            │           │
  │           │            │─UPDATE───→│
  │           │            │           │
  │           │←────Response────       │
  │           │            │           │
  │←─Confirm──│            │           │
  │           │            │           │
```

**LinkedIn OAuth Flow:**

```
User    →   Frontend   →   LinkedIn   →   Backend
  │           │            │           │
  │─Login────→│            │           │
  │           │            │           │
  │           │─OAuth Req──→│           │
  │           │            │           │
  │           │←─Auth Code──│           │
  │           │            │           │
  │           │─Exchange Code────────→ │
  │           │            │           │
  │           │ ←─Access Token────────│
  │           │            │           │
  │←─Success──│            │           │
  │           │            │           │
```

---

### 3.6 Activity Diagram

**Post Publishing Activity Flow:**

```
Start
  ↓
User Opens Create Post Page
  ↓
Enter Post Content
  ↓
Select Post Type (Text/Image/Link)
  ↓
[Decision] Publish Now?
  ├─ Yes → Validate Content
  │        ↓
  │        Publish to LinkedIn
  │        ↓
  │        Show Success Message
  │
  └─ No → Select Date & Time
           ↓
           Validate Schedule Time
           ↓
           [Decision] Valid?
           ├─ No → Show Error, Loop Back
           │
           └─ Yes → Save as Scheduled
                    ↓
                    Show Confirmation
                    ↓
End
```

---

### 3.7 Component Diagram

```
┌────────────────────────────────────────────┐
│         React Frontend Components           │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │     Layout Components                │  │
│  │ ├─ Header                            │  │
│  │ ├─ Sidebar                           │  │
│  │ └─ Footer                            │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │     Page Components                  │  │
│  │ ├─ Dashboard                         │  │
│  │ ├─ CreatePost                        │  │
│  │ ├─ Posts                             │  │
│  │ ├─ Analytics                         │  │
│  │ ├─ Settings                          │  │
│  │ ├─ LinkedInVault                     │  │
│  │ └─ Automation                        │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │     UI Components (shadcn/ui)        │  │
│  │ ├─ Button, Input, Card               │  │
│  │ ├─ Dialog, Modal, Tabs               │  │
│  │ ├─ Form, Select, Checkbox            │  │
│  │ └─ Toast, Alert, Badge               │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │     State Management (Zustand)       │  │
│  │ ├─ useAuthStore                      │  │
│  │ ├─ useLinkedInStore                  │  │
│  │ └─ useDataStore                      │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │     Utility & Services               │  │
│  │ ├─ API Client (axios)                │  │
│  │ ├─ OAuth Handler                     │  │
│  │ └─ Data Validators                   │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
         ↓ HTTP/REST
┌────────────────────────────────────────────┐
│      Fastify Backend (localhost:4000)       │
└────────────────────────────────────────────┘
```

---

### 3.8 Deployment Diagram

**Development Environment:**

```
┌─────────────────────────────────────────────┐
│          Developer Machine                  │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │      VS Code                           │ │
│  │  ├─ React Frontend (localhost:3000)   │ │
│  │  └─ npm/pnpm dev server               │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │      Fastify Backend (localhost:4000)  │ │
│  │  ├─ Express routes                    │ │
│  │  └─ Database connection               │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │      Database (PostgreSQL)             │ │
│  │  ├─ User data                         │ │
│  │  ├─ Posts                             │ │
│  │  └─ Analytics                         │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Production Environment:**

```
┌───────────────────────────────────────────────┐
│         User Browser                          │
│  ├─ Chrome, Firefox, Safari, Edge             │
│  └─ HTTPS Connection                          │
└────────────┬────────────────────────────────┘
             ↓
┌────────────────────────────────────────────┐
│      CDN / Web Server                       │
│  ├─ Static assets (React build)            │
│  └─ gzip compression                       │
└────────────┬────────────────────────────────┘
             ↓
┌────────────────────────────────────────────┐
│      Load Balancer                         │
│  └─ Route to available instances           │
└────────────┬────────────────────────────────┘
             ↓
┌────────────────────────────────────────────┐
│   Fastify Backend Cluster                  │
│  ├─ Multiple instances (Docker)            │
│  └─ Auto-scaling                           │
└────────────┬────────────────────────────────┘
             ↓
┌────────────────────────────────────────────┐
│   Database Cluster                         │
│  ├─ PostgreSQL (primary/replica)           │
│  └─ Automated backups                      │
└────────────────────────────────────────────┘
```

---

### 3.9 Interface Diagram

**Core User Interfaces:**

**1. Dashboard Interface**
```
┌─────────────────────────────────────────┐
│ Header: LinkedInFlow Logo | User Menu   │
├──────────┬──────────────────────────────┤
│ Sidebar  │ Main Content Area            │
│          │ ┌──────────────────────────┐ │
│ • Home   │ │ Welcome, [User Name]!    │ │
│ • Create │ │                          │ │
│ • Posts  │ │ Quick Stats:             │ │
│ • Analyt │ │ [Cards with metrics]     │ │
│ • Vault  │ │                          │ │
│ • Auto   │ │ Recent Posts:            │ │
│ • Sett   │ │ [Post list]              │ │
│          │ └──────────────────────────┘ │
└──────────┴──────────────────────────────┘
```

**2. Create Post Interface**
```
┌─────────────────────────────────────────┐
│ Create Post                      [X]    │
├─────────────────────────────────────────┤
│ Post Type: [Text ▼] [Image] [Link]     │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Write your post content here...     │ │
│ │                                     │ │
│ │ (300/3000 characters)               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Preview] [📎 Attach]                  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ LinkedIn Preview:                   │ │
│ │ [Post preview card]                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Schedule Date: [Pick Date] [Pick Time] │
│                                         │
│ [Save Draft] [Publish Now] [Schedule] │
└─────────────────────────────────────────┘
```

**3. Posts Management Interface**
```
┌─────────────────────────────────────────┐
│ Posts                    [+ New Post]   │
├──────────────────────────────────────────┤
│ Tabs: All | Draft | Scheduled | Pub | Fail
│                                         │
│ Filter: [Search] [Date Range] [Type] │
│                                         │
│ ┌────────────────────────────────────┐ │
│ │ Post │ Status │ Date │ Eng │ Action │
│ ├────────────────────────────────────┤ │
│ │ P1   │ Draft  │ ...  │ -   │ E D Pu│ │
│ │ P2   │ Sched  │ ...  │ -   │ E D   │ │
│ │ P3   │ Pub    │ ...  │ 2.5%│ - D   │ │
│ └────────────────────────────────────┘ │
│                                         │
│ [< Previous] [1] [2] [3] [Next >]      │
└─────────────────────────────────────────┘
```

---

### 3.10 Website Map Diagram

**LinkedInFlow Sitemap:**

```
LinkedInFlow
│
├── Public Pages
│   ├── Landing (/)
│   ├── Login (/login)
│   ├── Signup (/signup)
│   └── OAuth Callback (/api/oauth/linkedin/callback)
│
└── Authenticated Pages
    │
    ├── Dashboard (/)
    │   └── Quick stats, recent activity
    │
    ├── Create Post (/create-post)
    │   ├── Draft management
    │   ├── Schedule editor
    │   └── Preview
    │
    ├── Posts (/posts)
    │   ├── All Posts
    │   ├── Drafts
    │   ├── Scheduled
    │   ├── Published
    │   └── Failed
    │
    ├── Analytics (/analytics)
    │   ├── Overview
    │   ├── Performance
    │   ├── Engagement
    │   └── Trends
    │
    ├── LinkedIn Vault (/linkedin-vault)
    │   ├── Connected Accounts
    │   ├── Token Management
    │   └── Account Settings
    │
    ├── Automation (/automation)
    │   ├── Rules
    │   ├── Triggers
    │   ├── Schedules
    │   └── Batch Processing
    │
    ├── Content Calendar (/calendar)
    │   ├── Monthly View
    │   ├── Weekly View
    │   └── Post Details
    │
    ├── Settings (/settings)
    │   ├── Profile
    │   ├── Account
    │   ├── Preferences
    │   └── Integrations
    │
    └── User Menu
        ├── Profile
        ├── Help
        └── Logout
```

---

## CHAPTER 4: IMPLEMENTATION & USER MANUAL

### 4.1 User Interface Design (Screens)

#### Screen 1: Dashboard

**Purpose:** Display overview of user activity and key metrics

**Components:**
- Welcome header with user name
- Quick stats cards (Total Posts, Published, Scheduled, Drafts)
- Recent posts widget
- Analytics preview
- Quick action buttons

**Layout:**
```
Grid: 12 columns
Responsive: 
  - Desktop: 3-column stats, full-width widgets
  - Tablet: 2-column stats, stacked widgets
  - Mobile: 1-column stats, full-width widgets
```

#### Screen 2: Create/Edit Post

**Purpose:** Enable users to create and manage posts

**Components:**
- Post type selector (Text, Image, Link)
- Content editor (textarea with character counter)
- Media upload (for images)
- Link preview (for links)
- Schedule picker (date + time)
- LinkedIn preview panel
- Action buttons (Save Draft, Publish, Schedule)

**Validations:**
- Content not empty
- Content < 3000 characters
- Scheduled date > current date
- Media file size < 5MB

#### Screen 3: Posts Management

**Purpose:** View, filter, and manage all posts

**Components:**
- Tab navigation (All, Draft, Scheduled, Published, Failed)
- Filter controls (search, date range, type)
- Posts table/list
- Batch actions
- Pagination
- Action menu per post (Edit, Delete, Republish)

**Features:**
- Sort by date, status, engagement
- Multi-select for bulk operations
- Quick preview on hover
- Status badges

#### Screen 4: Analytics Dashboard

**Purpose:** Display performance metrics and insights

**Tabs:**
1. **Overview:** Total posts, total engagement
2. **Performance:** Top posts by engagement
3. **Engagement:** Detailed metrics per post
4. **Trends:** Historical performance graph

**Visualizations:**
- Line chart (posts over time)
- Bar chart (engagement by post)
- Pie chart (post type distribution)
- Metric cards (KPIs)

#### Screen 5: LinkedIn Vault

**Purpose:** Manage LinkedIn accounts and credentials

**Components:**
- Connected accounts list
- Account connect button (OAuth)
- Account details display
- Disconnect button
- Token refresh button
- Account permissions display

**Design:** Glassmorphism style (gradient overlay, backdrop blur)

#### Screen 6: Automation

**Purpose:** Set up automation rules and triggers

**Components:**
- Rule creation form
- Trigger type selector
- Action configurator
- Schedule builder
- Rule list with enable/disable
- Test rule button

**Design:** Glassmorphism style

#### Screen 7: Settings

**Purpose:** Manage user preferences

**Sections:**
- Profile: Edit name, email, avatar
- Account: Change password, 2FA
- Notifications: Email preferences
- Integrations: Connected services
- Data: Export, backup options
- About: Version, help links

---

### 4.2 ERD, List of Tables, Table Specifications

#### Entity Relationship Diagram

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │◄─────┐
│ email       │      │
│ username    │      │ 1:N
│ password    │      │
│ avatar      │      │
│ created_at  │      │
│ updated_at  │      │
└─────────────┘      │
                     │
┌──────────────────┐ │    ┌──────────────────┐
│ linkedin_tokens  │─┼───►│   posts          │
├──────────────────┤ │    ├──────────────────┤
│ id (PK)          │ │    │ id (PK)          │
│ user_id (FK)     │ │    │ user_id (FK)────┘
│ access_token     │ │    │ content          │
│ refresh_token    │ │    │ post_type        │
│ expires_at       │ │    │ link_url         │
│ created_at       │ │    │ status           │
└──────────────────┘ │    │ scheduled_at     │
                     │    │ published_at     │
                     │    │ created_at       │
                     │    │ updated_at       │
                     │    └──────────────────┘
                     │            │
                     │            │1:N
                     │            ▼
                     │    ┌──────────────────┐
                     └───►│   analytics      │
                          ├──────────────────┤
                          │ id (PK)          │
                          │ post_id (FK)     │
                          │ impressions      │
                          │ likes            │
                          │ comments         │
                          │ shares           │
                          │ engagement_rate  │
                          │ fetched_at       │
                          └──────────────────┘
```

#### Tables Specification

**Table: users**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| username | VARCHAR(100) | UNIQUE, NOT NULL | Display username |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| avatar_url | VARCHAR(500) | | Profile picture URL |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Create Table Query:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

---

**Table: linkedin_tokens**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique token record |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to user |
| access_token | TEXT | NOT NULL | OAuth access token |
| refresh_token | TEXT | | OAuth refresh token |
| token_type | VARCHAR(50) | DEFAULT 'Bearer' | Token type |
| expires_in | INTEGER | | Token expiration (seconds) |
| expires_at | TIMESTAMP | | Token expiration datetime |
| created_at | TIMESTAMP | DEFAULT NOW() | Token creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last refresh time |

**Create Table Query:**
```sql
CREATE TABLE linkedin_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expires_in INTEGER,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_linkedin_tokens_user_id ON linkedin_tokens(user_id);
```

---

**Table: posts**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique post identifier |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to user |
| content | TEXT | NOT NULL | Post content/caption |
| post_type | VARCHAR(50) | NOT NULL | 'text', 'image', 'link' |
| link_url | VARCHAR(500) | | URL for link posts |
| media_url | VARCHAR(500) | | Image URL for image posts |
| status | VARCHAR(50) | NOT NULL | 'draft', 'published', 'scheduled', 'failed' |
| scheduled_at | TIMESTAMP | | Scheduled publication time |
| published_at | TIMESTAMP | | Actual publication time |
| linkedin_post_id | VARCHAR(255) | | LinkedIn post ID after publish |
| error_message | TEXT | | Error details if failed |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Create Table Query:**
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type VARCHAR(50) NOT NULL CHECK (post_type IN ('text', 'image', 'link')),
  link_url VARCHAR(500),
  media_url VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'published', 'scheduled', 'failed')),
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  linkedin_post_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

---

**Table: analytics**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique analytics record |
| post_id | UUID | FOREIGN KEY, NOT NULL | Reference to post |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to user |
| impressions | INTEGER | DEFAULT 0 | Post views |
| likes | INTEGER | DEFAULT 0 | Like count |
| comments | INTEGER | DEFAULT 0 | Comment count |
| shares | INTEGER | DEFAULT 0 | Share count |
| engagement_rate | DECIMAL(5,2) | | Calculated engagement % |
| fetched_at | TIMESTAMP | | When data was fetched |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Create Table Query:**
```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  impressions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2),
  fetched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_post_id ON analytics(post_id);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_fetched_at ON analytics(fetched_at);
```

---

### 4.3 Program Specifications & Flow Charts

#### Module 1: Authentication Module

**Specification:**
- Handle user registration and login
- Manage session tokens
- Implement LinkedIn OAuth flow
- Token refresh logic

**Key Functions:**

```typescript
// Authentication Functions
async function signup(email: string, username: string, password: string): Promise<User>
async function login(email: string, password: string): Promise<{user: User, token: string}>
async function logout(): Promise<void>
async function checkAuth(): Promise<User | null>
async function refreshToken(): Promise<string>
```

**Flow Chart - Login Process:**
```
Start
  ↓
User enters email & password
  ↓
[Validation] Fields valid?
├─ No → Show error, exit
│
└─ Yes → Hash password
         ↓
         Query database
         ↓
         [Decision] User found?
         ├─ No → Show "Invalid credentials"
         │
         └─ Yes → Compare password hashes
                  ↓
                  [Decision] Match?
                  ├─ No → Show "Invalid credentials"
                  │
                  └─ Yes → Generate session token
                           ↓
                           Store in localStorage
                           ↓
                           Redirect to Dashboard
                           ↓
                           End
```

#### Module 2: Post Management Module

**Specification:**
- Create, read, update, delete posts
- Handle different post types
- Manage post status transitions
- Validate post data

**Key Functions:**

```typescript
async function createPost(data: CreatePostDTO): Promise<Post>
async function getPost(id: string): Promise<Post>
async function updatePost(id: string, data: UpdatePostDTO): Promise<Post>
async function deletePost(id: string): Promise<void>
async function getPostsByStatus(status: PostStatus): Promise<Post[]>
async function publishPost(id: string): Promise<Post>
async function schedulePost(id: string, scheduledAt: Date): Promise<Post>
```

**Flow Chart - Create & Schedule Post:**
```
Start
  ↓
User fills post form
  ↓
[Validation]
├─ Content not empty?
├─ Content length valid?
├─ Media file size OK? (if image)
└─ All valid? 
   ├─ No → Show errors, return
   │
   └─ Yes → User selects action
            ↓
            [Decision] Action type?
            │
            ├─ Save Draft
            │  ↓
            │  POST /api/posts (status: 'draft')
            │  ↓
            │  Return to Posts view
            │
            ├─ Publish Now
            │  ↓
            │  POST /api/posts (status: 'published')
            │  ↓
            │  Call LinkedIn API
            │  ↓
            │  Update status to 'published'
            │  ↓
            │  Show success
            │
            └─ Schedule
               ↓
               Validate schedule date/time
               ↓
               [Decision] Time valid?
               ├─ No → Show error
               │
               └─ Yes → POST /api/posts (status: 'scheduled')
                        ↓
                        Store scheduled_at
                        ↓
                        Show confirmation
                        ↓
End
```

#### Module 3: LinkedIn OAuth Module

**Specification:**
- Handle OAuth authentication
- Exchange authorization code for access token
- Store and manage access tokens
- Handle token refresh

**Key Functions:**

```typescript
function getLinkedInAuthURL(): string
async function handleOAuthCallback(code: string, state: string): Promise<User>
async function exchangeCodeForToken(code: string): Promise<LinkedInToken>
async function refreshLinkedInToken(userId: string): Promise<string>
async function disconnectLinkedIn(userId: string): Promise<void>
```

**Flow Chart - LinkedIn OAuth:**
```
Start
  ↓
User clicks "Connect LinkedIn"
  ↓
Redirect to LinkedIn OAuth endpoint
  ↓
User authorizes LinkedInFlow app
  ↓
LinkedIn redirects to callback URL with code
  ↓
Backend exchanges code for access token
  ↓
[Decision] Exchange successful?
├─ No → Show error page
│
└─ Yes → Store access_token & refresh_token
         ↓
         Update user.linkedin_connected = true
         ↓
         Redirect to Dashboard
         ↓
         Show success message
         ↓
End
```

#### Module 4: Analytics Module

**Specification:**
- Fetch post metrics from LinkedIn
- Calculate engagement rates
- Store analytics data
- Display analytics visualizations

**Key Functions:**

```typescript
async function fetchPostMetrics(postId: string): Promise<PostMetrics>
async function calculateEngagementRate(metrics: PostMetrics): number
async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary>
async function getPostAnalytics(postId: string): Promise<PostMetrics>
function generateChartData(posts: Post[], metrics: Map<string, PostMetrics>): ChartData[]
```

**Flow Chart - Analytics Update:**
```
Start
  ↓
User navigates to Analytics
  ↓
Load cached analytics data
  ↓
[Decision] Data older than 1 hour?
├─ No → Display cached data
│       ↓
│       End
│
└─ Yes → Fetch fresh data
         ↓
         GET /api/analytics/summary
         ↓
         Calculate engagement rates
         ↓
         Update store
         ↓
         Generate chart data
         ↓
         Display refreshed analytics
         ↓
         End
```

---

### 4.4 Code Snippet

#### Code Snippet 1: Post Creation API Call

**File:** `src/lib/api.ts`

```typescript
export const postsAPI = {
  createPost: async (postData: {
    content: string;
    post_type: 'text' | 'image' | 'link';
    link_url?: string;
    media_url?: string;
    status: 'draft' | 'published' | 'scheduled';
    scheduled_at?: string;
  }): Promise<Post> => {
    const response = await axios.post('/api/posts', postData, {
      withCredentials: true
    });
    return response.data;
  },

  getPost: async (id: string): Promise<Post> => {
    const response = await axios.get(`/api/posts/${id}`, {
      withCredentials: true
    });
    return response.data;
  },

  updatePost: async (id: string, data: Partial<Post>): Promise<Post> => {
    const response = await axios.patch(`/api/posts/${id}`, data, {
      withCredentials: true
    });
    return response.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await axios.delete(`/api/posts/${id}`, {
      withCredentials: true
    });
  },

  publishPost: async (id: string): Promise<Post> => {
    const response = await axios.patch(
      `/api/posts/${id}/publish`,
      {},
      { withCredentials: true }
    );
    return response.data;
  }
};
```

#### Code Snippet 2: Authentication Store (Zustand)

**File:** `src/store/useAuthStore.ts`

```typescript
import { create } from 'zustand';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await authAPI.me();
      set({ user, isAuthenticated: true, error: null });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authAPI.login(email, password);
      localStorage.setItem('auth_token', token);
      set({ user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Login failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}));
```

#### Code Snippet 3: Post Creation Component

**File:** `src/pages/CreatePost.tsx`

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { postsAPI } from '@/lib/api';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { toast } from 'sonner';

const postSchema = z.object({
  content: z.string().min(1, 'Content required').max(3000),
  post_type: z.enum(['text', 'image', 'link']),
  link_url: z.string().url().optional(),
  scheduled_at: z.string().optional()
});

type PostFormData = z.infer<typeof postSchema>;

export function CreatePost() {
  const [postType, setPostType] = useState<'text' | 'image' | 'link'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setPosts } = useLinkedInStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PostFormData>({
    resolver: zodResolver(postSchema)
  });

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    try {
      const newPost = await postsAPI.createPost({
        ...data,
        post_type: postType,
        status: 'draft'
      });

      toast.success('Post created successfully!');
      reset();
      // Update store
      setPosts([newPost]);
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create New Post</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Post Type Selection */}
          <div className="flex gap-2">
            {(['text', 'image', 'link'] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant={postType === type ? 'default' : 'outline'}
                onClick={() => setPostType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          {/* Content */}
          <div>
            <Textarea
              {...register('content')}
              placeholder="Write your post..."
              className="min-h-48"
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
            )}
          </div>

          {/* Link URL (if type is link) */}
          {postType === 'link' && (
            <div>
              <Input
                {...register('link_url')}
                placeholder="https://example.com"
                type="url"
              />
              {errors.link_url && (
                <p className="text-red-500 text-sm mt-1">{errors.link_url.message}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              Publish Now
            </Button>
          </div>
        </form>
      </Card>

      {/* LinkedIn Preview */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4">Preview</h2>
        <LinkedInPreview />
      </Card>
    </div>
  );
}
```

#### Code Snippet 4: LinkedIn OAuth Handler

**File:** `src/hooks/useLinkedInOAuth.ts`

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { linkedInAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export function useLinkedInOAuth() {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');

      if (error) {
        toast.error(`Authorization failed: ${error}`);
        navigate('/settings');
        return;
      }

      if (!code) {
        navigate('/settings');
        return;
      }

      try {
        // Complete OAuth flow
        await linkedInAPI.finishOAuth(code, state || '');
        
        // Refresh auth state
        await checkAuth();
        
        toast.success('LinkedIn account connected!');
        navigate('/');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to connect LinkedIn');
        navigate('/settings');
      }
    };

    if (window.location.pathname === '/api/oauth/linkedin/callback') {
      handleCallback();
    }
  }, [navigate, checkAuth]);
}

export function initiateLinkedInOAuth() {
  // Redirect to LinkedIn OAuth URL
  const clientId = process.env.REACT_APP_LINKEDIN_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/oauth/linkedin/callback`;
  const state = Math.random().toString(36).substring(7);

  const linkedInAuthURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=w_member_social`;

  window.location.href = linkedInAuthURL;
}
```

---

### 4.5 Test Procedures, Test Cases and Implementation

#### Test Strategy

**Testing Pyramid:**
```
        ▲
       /│\         E2E Tests (5%)
      / │ \        - Full user workflows
     /  │  \       - UI interactions
    /   │   \      - Cross-browser
   /────┼────\
  /     │     \    Integration Tests (25%)
 /      │      \   - API endpoints
/       │       \  - Database operations
────────┼────────  - State management
        │
    Unit Tests (70%)
    - Individual functions
    - Components
    - Utilities
```

#### Unit Tests

**Test File:** `src/__tests__/utils.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { calculateEngagementRate, formatDate, validateEmail } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('calculateEngagementRate', () => {
    it('should calculate engagement rate correctly', () => {
      const metrics = {
        impressions: 1000,
        likes: 50,
        comments: 10,
        shares: 5
      };
      const rate = calculateEngagementRate(metrics);
      expect(rate).toBe(6.5); // (50 + 10 + 5) / 1000 * 100
    });

    it('should return 0 if impressions are 0', () => {
      const metrics = {
        impressions: 0,
        likes: 50,
        comments: 10,
        shares: 5
      };
      const rate = calculateEngagementRate(metrics);
      expect(rate).toBe(0);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-04-17');
      const formatted = formatDate(date);
      expect(formatted).toBe('Apr 17, 2024');
    });
  });
});
```

#### Integration Tests

**Test File:** `src/__tests__/api.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { postsAPI, linkedInAPI } from '@/lib/api';

describe('API Integration Tests', () => {
  describe('Posts API', () => {
    it('should create a new post', async () => {
      const postData = {
        content: 'Test post',
        post_type: 'text' as const,
        status: 'draft' as const
      };

      const post = await postsAPI.createPost(postData);
      
      expect(post).toBeDefined();
      expect(post.content).toBe('Test post');
      expect(post.status).toBe('draft');
    });

    it('should get post by ID', async () => {
      const postId = 'test-post-id';
      const post = await postsAPI.getPost(postId);
      
      expect(post).toBeDefined();
      expect(post.id).toBe(postId);
    });

    it('should update post', async () => {
      const postId = 'test-post-id';
      const updates = { content: 'Updated content' };
      
      const post = await postsAPI.updatePost(postId, updates);
      
      expect(post.content).toBe('Updated content');
    });

    it('should delete post', async () => {
      const postId = 'test-post-id';
      
      await expect(postsAPI.deletePost(postId)).resolves.toBeUndefined();
    });
  });

  describe('LinkedIn API', () => {
    it('should connect LinkedIn account', async () => {
      const code = 'test-auth-code';
      const result = await linkedInAPI.finishOAuth(code, 'test-state');
      
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it('should fetch LinkedIn status', async () => {
      const status = await linkedInAPI.getStatus();
      
      expect(status).toHaveProperty('connected');
    });
  });
});
```

#### End-to-End Tests

**Test File:** `e2e/create-post.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Create Post Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Login first
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForNavigation();
  });

  test('should create and publish a text post', async ({ page }) => {
    // Navigate to create post
    await page.click('a:has-text("Create Post")');
    await page.waitForLoadState('networkidle');

    // Fill post form
    await page.fill('textarea', 'This is a test post');
    
    // Publish
    await page.click('button:has-text("Publish Now")');

    // Verify success
    await expect(page.locator('text=Post published successfully')).toBeVisible();
    
    // Navigate to posts page
    await page.click('a:has-text("Posts")');
    
    // Verify post appears in published tab
    await page.click('button:has-text("Published")');
    await expect(page.locator('text=This is a test post')).toBeVisible();
  });

  test('should schedule a post for later', async ({ page }) => {
    // Navigate to create post
    await page.click('a:has-text("Create Post")');

    // Fill post form
    await page.fill('textarea', 'Scheduled post');

    // Select schedule option
    await page.click('button:has-text("Schedule")');
    
    // Pick future date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[type="date"]', tomorrow.toISOString().split('T')[0]);
    await page.fill('input[type="time"]', '14:00');

    // Schedule
    await page.click('button:has-text("Schedule Post")');

    // Verify success
    await expect(page.locator('text=Post scheduled')).toBeVisible();
  });
});
```

#### Test Case Matrix

| Test ID | Module | Scenario | Input | Expected Output | Status |
|---------|--------|----------|-------|-----------------|--------|
| TC-1 | Auth | Valid login | email, password | User logged in | ✓ |
| TC-2 | Auth | Invalid password | email, wrong_password | Error message | ✓ |
| TC-3 | Post | Create text post | content | Post in draft status | ✓ |
| TC-4 | Post | Publish post | post_id | Post status = published | ✓ |
| TC-5 | Post | Schedule post | post_id, date, time | Post status = scheduled | ✓ |
| TC-6 | Post | Delete draft post | post_id | Post deleted | ✓ |
| TC-7 | LinkedIn | OAuth connect | auth_code | LinkedIn token stored | ✓ |
| TC-8 | Analytics | Fetch metrics | post_id | Metrics displayed | ✓ |
| TC-9 | Form | Validate email | invalid_email | Validation error | ✓ |
| TC-10 | Form | Character limit | 3001 chars | Validation error | ✓ |

---

### 4.6 User Manual

#### Getting Started

**System Requirements:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (minimum 5 Mbps)
- LinkedIn account for OAuth connection

**Accessing LinkedInFlow:**
1. Open your web browser
2. Navigate to `https://linkedinflow.com` (or your deployment URL)
3. Create account or log in

#### Account Creation

**Step 1: Sign Up**
```
1. Click "Sign Up" button on login page
2. Enter your email address
3. Create a username (3-20 characters)
4. Set a strong password (minimum 8 characters)
5. Click "Create Account"
6. Check email for verification link (if required)
7. Click verification link
8. Account ready to use!
```

**Step 2: Connect LinkedIn**
```
1. Navigate to Settings
2. Click "Connect LinkedIn Account"
3. You'll be redirected to LinkedIn
4. Review requested permissions
5. Click "Allow" to authorize
6. You'll be redirected back to LinkedInFlow
7. LinkedIn account is now connected!
```

#### Creating Your First Post

**Method 1: Create Text Post**

```
1. Click "Create Post" in main navigation
2. Select post type: "Text"
3. Click in the content editor
4. Type your post content (up to 3000 characters)
5. (Optional) Click "Preview" to see how it looks
6. Choose action:
   - "Save Draft": Save for later editing
   - "Publish Now": Publish immediately
   - "Schedule": Set date and time for publication
7. Confirm your choice
8. Post is created!
```

**Method 2: Create Image Post**

```
1. Click "Create Post" → Select "Image"
2. Either:
   - Drag and drop image file onto the editor
   - Click upload button to browse files
3. Supported formats: JPG, PNG, GIF (Max 5MB)
4. Add caption text (optional)
5. Click Preview to see LinkedIn rendering
6. Choose publish method (now/draft/schedule)
7. Confirm
```

**Method 3: Create Link Post**

```
1. Click "Create Post" → Select "Link"
2. Paste URL: https://example.com
3. Add descriptive text (optional)
4. Preview shows link metadata
5. Choose publish method
6. Confirm
```

#### Managing Posts

**Viewing All Posts:**
```
1. Click "Posts" in navigation
2. You see 5 tabs:
   - All: All your posts
   - Draft: Unpublished posts
   - Scheduled: Posts set for future
   - Published: Live posts
   - Failed: Posts that failed to publish

3. Use filters:
   - Search by content
   - Filter by date range
   - Sort by date/status/engagement
```

**Editing a Post:**
```
1. Go to Posts page
2. Find your post in Draft tab
3. Click "Edit" button
4. Modify content or schedule
5. Click "Update"
```

**Deleting a Post:**
```
1. Go to Posts page
2. Find your post
3. Click "..." (more options)
4. Select "Delete"
5. Confirm deletion
6. Post is removed
```

**Publishing Draft Posts:**
```
1. Go to Posts page
2. Click "Draft" tab
3. Select post(s) to publish (checkbox)
4. Click "Publish Selected"
5. Confirm
6. Posts are now live on LinkedIn
```

#### Analytics Dashboard

**Accessing Analytics:**
```
1. Click "Analytics" in navigation
2. View 4 tabs:
   - Overview: Total metrics
   - Performance: Top posts
   - Engagement: Detailed metrics
   - Trends: Historical graphs
```

**Understanding Metrics:**

| Metric | Description |
|--------|-------------|
| Impressions | Number of times post was viewed |
| Engagement | Likes + Comments + Shares |
| Engagement Rate | Engagement / Impressions × 100 |
| Reach | Unique users who saw post |

**Analyzing Performance:**
```
1. View Overview tab for total stats
2. Check Performance tab for top posts
3. Review Engagement tab for post details
4. Check Trends tab to see growth over time
5. Use date filters to analyze periods
```

#### LinkedIn Vault

**Purpose:** Securely manage your LinkedIn credentials

**Connecting Account:**
```
1. Go to LinkedIn Vault
2. Click "Connect New Account"
3. Follow OAuth flow
4. Account appears in list
```

**Viewing Connected Accounts:**
```
1. Go to LinkedIn Vault
2. See list of connected accounts
3. View account name and profile URL
4. See last connected date
5. Check account permissions
```

**Disconnecting Account:**
```
1. Go to LinkedIn Vault
2. Find account to disconnect
3. Click "Disconnect" button
4. Confirm action
5. Account removed (posts already published remain)
```

#### Automation Setup

**Creating Automation Rules:**
```
1. Go to Automation
2. Click "Create Rule"
3. Set trigger type:
   - Time-based (daily, weekly)
   - Content-based (keywords)
   - Manual trigger
4. Configure action:
   - Publish scheduled post
   - Send notification
   - Archive post
5. Set frequency
6. Save rule
7. Rule is active
```

**Managing Rules:**
```
1. Go to Automation
2. View all active rules
3. Toggle rule on/off
4. Edit rule settings
5. Delete rule
6. Test rule with "Test Run" button
```

#### Settings & Preferences

**Profile Settings:**
```
1. Go to Settings
2. Click "Profile" tab
3. Edit:
   - Display name
   - Email address
   - Profile picture
   - Bio
4. Click "Save"
```

**Account Security:**
```
1. Go to Settings
2. Click "Account" tab
3. Change password:
   - Enter current password
   - Enter new password
   - Confirm new password
   - Click "Update Password"
4. Enable 2-Factor Authentication (recommended):
   - Click "Enable 2FA"
   - Follow app setup
   - Save backup codes
```

**Notification Preferences:**
```
1. Go to Settings
2. Click "Notifications" tab
3. Toggle email notifications:
   - Post published
   - Post failed
   - Schedule reached
   - Analytics update
4. Save preferences
```

#### Troubleshooting

**Problem: Can't log in**
- Check email/password are correct
- Reset password if forgotten
- Clear browser cache and try again

**Problem: LinkedIn connection fails**
- LinkedIn account must not be private
- Clear browser cookies
- Try different browser
- Check internet connection

**Problem: Post fails to publish**
- Check post content (may violate LinkedIn guidelines)
- Verify LinkedIn account is still connected
- Check error message for details
- Retry or edit and republish

**Problem: Analytics not updating**
- Analytics update every few hours
- Click "Refresh" button for manual update
- Check if post is old (>30 days may have limited data)
- Verify LinkedIn permissions

**Problem: Scheduled post not publishing**
- Check system date/time is correct
- Verify LinkedIn account still connected
- Check post status shows "Scheduled"
- Manual retry from Posts page

#### Security Best Practices

1. **Password:**
   - Use strong password (12+ characters)
   - Include uppercase, numbers, symbols
   - Change every 3-6 months
   - Don't share password

2. **2-Factor Authentication:**
   - Enable for account protection
   - Save backup codes
   - Use authenticator app

3. **LinkedIn Account:**
   - Don't share LinkedIn credentials
   - Use OAuth for secure connection
   - Disconnect unused accounts
   - Review account permissions

4. **Browsing:**
   - Don't use public Wi-Fi
   - Use HTTPS connections
   - Logout when done
   - Clear browser data regularly

---

### 4.7 Operations Manual / Menu Explanation

#### Dashboard Navigation

**Top Navigation Bar:**
```
[LinkedInFlow Logo] [Search] [Notifications ⓘ] [User Menu ⓥ]
```

- **Logo**: Click to return to dashboard anytime
- **Search**: Search posts by content, date, or status
- **Notifications**: View system alerts and updates
- **User Menu**: Profile, settings, help, logout

**Left Sidebar:**

```
MAIN
├─ 🏠 Dashboard       → Overview & stats
├─ ✏️  Create Post     → New post creation
├─ 📋 Posts           → Manage all posts
└─ 📊 Analytics       → Performance data

CONFIGURATION  
├─ 💾 LinkedIn Vault  → Manage LinkedIn accounts
├─ ⚙️  Automation      → Automation rules
└─ 📅 Calendar        → Content calendar

SETTINGS & SUPPORT
├─ ⚙️  Settings        → Account & preferences
└─ ❓ Help             → Documentation & support
```

#### Dashboard Header Menu

**File Menu** (when available):
```
File
├─ New Post           (Ctrl+N)
├─ Import Posts       
├─ Export Data        
└─ Exit               (Ctrl+Q)
```

**Edit Menu:**
```
Edit
├─ Undo               (Ctrl+Z)
├─ Redo               (Ctrl+Y)
├─ Cut                (Ctrl+X)
├─ Copy               (Ctrl+C)
├─ Paste              (Ctrl+V)
└─ Select All         (Ctrl+A)
```

**View Menu:**
```
View
├─ Refresh            (F5)
├─ Dark Mode          
├─ Sidebar Toggle     
├─ Full Screen        (F11)
└─ Developer Tools    (F12)
```

**Help Menu:**
```
Help
├─ Documentation      
├─ Video Tutorials    
├─ Contact Support    
├─ Report Bug         
└─ About LinkedInFlow 
```

#### Context Menus

**Post Card Context Menu:**
```
Right-click on post:
├─ View Details       
├─ Edit               
├─ Duplicate          
├─ Publish            (if draft)
├─ Reschedule         (if scheduled)
├─ Share (post link)  
├─ Analytics          
├─ Archive            
└─ Delete             
```

**User Menu Context:**
```
Click user avatar:
├─ 👤 Profile         
├─ ⚙️  Settings        
├─ 🌙 Theme            
├─ 🔑 Manage Accounts  
├─ 📊 Analytics        
├─ ❓ Help & Support   
├─ 🔔 Notifications    
└─ 🚪 Logout           
```

#### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New post |
| `Ctrl+S` | Save draft |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+/` | Search |
| `Ctrl+,` | Settings |
| `F5` | Refresh page |
| `F11` | Fullscreen |
| `F12` | Developer tools |
| `ESC` | Close modal |
| `Tab` | Navigate fields |
| `Enter` | Submit form |

#### Performance Indicators

**Status Indicators:**

```
🟢 Green:  System operational, post published
🟡 Yellow: System warning, post scheduled
🔴 Red:   Error, post failed
⚪ Gray:   Draft, not published
```

**Connection Status:**
```
┌─ LinkedInFlow Status
├─ ✅ Connected to LinkedIn
├─ ✅ Server responding
├─ ✅ Database online
└─ Sync: Last updated 2 mins ago
```

#### Report & Export Functions

**Generate Report:**
```
1. Go to Analytics
2. Click "Generate Report"
3. Select period:
   - Last 7 days
   - Last 30 days
   - Last 90 days
   - Custom range
4. Select metrics to include
5. Choose format (PDF/CSV/Excel)
6. Click "Generate"
7. Report downloads
```

**Export Data:**
```
1. Go to Settings → Data
2. Click "Export All Data"
3. Select what to export:
   - Posts only
   - Analytics only
   - Everything
4. Choose format
5. Click "Export"
6. ZIP file downloads with all data
```

**Import Posts:**
```
1. Go to Posts
2. Click "Import Posts"
3. Upload CSV or JSON file
4. Map columns to fields
5. Preview imported posts
6. Click "Import"
7. Posts imported as drafts
```

#### System Monitoring

**Performance Dashboard (Admin):**
```
1. Navigate to Admin Panel (if available)
2. View:
   - Server status
   - Database health
   - API response times
   - Error rates
   - User activity
   - System resources
```

**Logs & Debugging:**
```
1. Browser Developer Tools (F12)
2. Console tab:
   - Check for JavaScript errors
   - View API responses
   - Debug state
3. Network tab:
   - Monitor API calls
   - Check response times
   - Verify authentication
4. Storage tab:
   - Check localStorage (auth_token)
   - View session cookies
```

---

## APPENDIX A: GLOSSARY

| Term | Definition |
|------|-----------|
| OAuth | Open authentication protocol for secure third-party access |
| JWT | JSON Web Token - secure token format |
| API | Application Programming Interface - software communication |
| REST | Representational State Transfer - web service architecture |
| UI/UX | User Interface / User Experience - design and interaction |
| Redux/Zustand | State management library |
| TypeScript | JavaScript with type safety |
| Vite | Fast build tool and dev server |
| Fastify | Fast backend web framework |
| PostgreSQL | Relational database |
| CDN | Content Delivery Network |
| HTTPS | Secure HTTP protocol |
| CSRF | Cross-Site Request Forgery - security threat |
| XSS | Cross-Site Scripting - security threat |
| SLA | Service Level Agreement |
| QA | Quality Assurance - testing |

---

## APPENDIX B: FILE STRUCTURE

```
linkedinflow-fe/
├── public/
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── AuthIllustration.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── posts/
│   │   │   ├── CreatePostModal.tsx
│   │   │   ├── EditPostModal.tsx
│   │   │   ├── LinkedInPreview.tsx
│   │   │   └── ImportModal.tsx
│   │   └── ui/
│   │       └── [shadcn/ui components]
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── CreatePost.tsx
│   │   ├── Posts.tsx
│   │   ├── Analytics.tsx
│   │   ├── LinkedInVault.tsx
│   │   ├── Automation.tsx
│   │   ├── Settings.tsx
│   │   └── LinkedInCallback.tsx
│   │
│   ├── store/
│   │   ├── useAuthStore.ts
│   │   ├── useLinkedInStore.ts
│   │   └── useDataStore.ts
│   │
│   ├── lib/
│   │   ├── api.ts          # All API calls
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── useLinkedInOAuth.ts
│   │   └── use-toast.ts
│   │
│   ├── contexts/
│   │   └── ThemeContext.tsx
│   │
│   ├── App.tsx             # Routes
│   ├── main.tsx
│   └── index.css           # Design tokens
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── DOCUMENTATION.md        # This file
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## APPENDIX C: API ENDPOINT REFERENCE

```
BASE_URL: http://localhost:4000

AUTHENTICATION
  POST   /api/signin          - User login
  POST   /api/signup          - User registration
  POST   /api/signout         - User logout
  GET    /api/me              - Get current user

POSTS
  POST   /api/posts           - Create post
  GET    /api/posts           - Get all user posts
  GET    /api/posts/:id       - Get single post
  PATCH  /api/posts/:id       - Update post
  DELETE /api/posts/:id       - Delete post
  PATCH  /api/posts/:id/publish - Publish post

LINKEDIN
  POST   /linkedin/connect    - Initiate OAuth
  POST   /linkedin/finish     - Complete OAuth
  GET    /linkedin/token/:id  - Get token info
  DELETE /linkedin/token/:id  - Disconnect account
  GET    /linkedin/status     - Get connection status

ANALYTICS
  GET    /api/analytics/summary        - Summary stats
  GET    /api/analytics/posts/:id      - Post metrics
  GET    /api/analytics/export         - Export data
```

---

**Document Version:** 1.0  
**Last Updated:** April 17, 2026  
**Author:** Development Team  
**Status:** Complete
