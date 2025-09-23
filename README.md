# 🚀 U-Fresher - Complete College Community Platform

A fully functional, aesthetically polished web application for college communities with real-time features, AI-powered content moderation, and comprehensive user management.

## ✨ Features

### 🔐 **Authentication & Authorization**
- **Supabase Auth Integration** - Real authentication with email/password
- **Admin Code System** - Role-based access with admin privileges
- **Google OAuth** - Social login integration
- **Role-based Routing** - Admin → Admin Panel, Users → Dashboard
- **Session Management** - Persistent user sessions

### 📊 **Dashboard with Real Stats**
- **Live Statistics** - Real-time data from Supabase
  - Communities Joined (max 1 per user)
  - Active Clubs (unlimited)
  - Total Mentors
  - Active Connections
- **Beautiful UI** - Gradient backgrounds, glass-morphism cards
- **Responsive Design** - Works on all devices

### 🏫 **Community & Club System**
- **One College Community** - Users can join only one college community
- **Multiple Clubs** - Users can join unlimited clubs within their community
- **Real-time Posts** - Create and view posts in clubs
- **Content Moderation** - AI-powered harassment detection using Gemini
- **Join/Leave Functionality** - Easy community and club management

### 💬 **Real-time Chat System**
- **Supabase Realtime** - Live messaging with instant updates
- **Professional UI** - Modern chat interface with avatars
- **Message Types** - Text, image, and file support
- **Mentorship Chat** - Dedicated chat for mentor-mentee relationships

### 🤖 **AI Content Moderation**
- **Gemini AI Integration** - Automatic content screening
- **Configurable** - Can be enabled/disabled via environment variables
- **Harassment Detection** - Flags inappropriate content
- **Moderation Logs** - Track all moderation actions

### 🎨 **Professional UI/UX**
- **Modern Design** - Gradient backgrounds and glass-morphism effects
- **Smooth Animations** - Hover effects, transitions, and loading states
- **Responsive Layout** - Mobile-first design
- **Accessibility** - Proper contrast and keyboard navigation
- **Loading States** - Skeleton loaders and spinners

## 🛠️ **Technology Stack**

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Full type safety
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful component library
- **Lucide React** - Modern icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Secure data access
- **Real-time Subscriptions** - Live updates

### AI & Moderation
- **Google Gemini AI** - Content moderation
- **Configurable** - Optional feature

### Deployment
- **Vercel** - Frontend deployment
- **Environment Variables** - Secure configuration

## 🚀 **Quick Start**

### 1. **Clone the Repository**
```bash
git clone <repository-url>
cd studysync-world-main
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Set up Supabase**
1. Create a new project at [Supabase](https://supabase.com)
2. Run the SQL commands from `SUPABASE_SCHEMA.md` in your Supabase SQL Editor
3. Note down your project URL and anon key

### 4. **Configure Environment Variables**
Create a `.env.local` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Admin Configuration
VITE_ADMIN_CODE=Createrkkrishavya

# Gemini AI Configuration (optional)
VITE_GEMINI_API_KEY=your-gemini-api-key

# Enable/Disable content moderation
VITE_ENABLE_MODERATION=true
```

### 5. **Start Development Server**
```bash
npm run dev
```

### 6. **Build for Production**
```bash
npm run build
```

## 📁 **Project Structure**

```
src/
├── components/ui/          # Reusable UI components
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useStats.ts        # Dashboard statistics
│   ├── useCommunities.ts  # Community management
│   ├── useClubs.ts        # Club management
│   ├── usePosts.ts        # Post management
│   ├── useMentorship.ts   # Mentorship system
│   └── useChat.ts         # Real-time chat
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Supabase client
│   ├── config.ts          # Configuration
│   └── gemini.ts          # AI moderation
├── pages/                 # Application pages
│   ├── Home.tsx           # Landing page
│   ├── Auth.tsx           # Authentication
│   ├── Dashboard.tsx      # Main dashboard
│   ├── Communities.tsx    # Community management
│   ├── ClubPosts.tsx      # Club posts
│   └── ChatRoom.tsx       # Real-time chat
└── App.tsx                # Main application
```

## 🔧 **Database Schema**

The application uses a comprehensive PostgreSQL schema with the following main tables:

- **users** - User profiles and authentication
- **communities** - College communities (one per user)
- **clubs** - Interest-based clubs (multiple per user)
- **club_posts** - Posts within clubs
- **mentors** - Mentor profiles
- **mentorships** - Mentor-mentee relationships
- **chat_rooms** - Chat room management
- **messages** - Real-time messages
- **moderation_logs** - Content moderation tracking

See `SUPABASE_SCHEMA.md` for complete schema details.

## 🎯 **Key Features Explained**

### **Community System**
- Users can join **exactly one** college community
- Communities represent different colleges/universities
- Each community can have multiple clubs

### **Club System**
- Users can join **unlimited** clubs within their community
- Clubs are interest-based (e.g., "Tech Innovators", "AI Research")
- Users can create posts and engage in discussions

### **Content Moderation**
- All posts are automatically screened using Gemini AI
- Flags inappropriate content including harassment, spam, etc.
- Can be disabled for development/testing

### **Real-time Features**
- Live chat using Supabase Realtime
- Instant post updates
- Real-time statistics

## 🚀 **Deployment to Vercel**

### 1. **Prepare for Deployment**
```bash
npm run build
```

### 2. **Deploy to Vercel**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy the application

### 3. **Environment Variables for Production**
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_CODE=your-secure-admin-code
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_ENABLE_MODERATION=true
```

## 🔐 **Security Features**

- **Row Level Security (RLS)** - Database-level access control
- **Role-based Permissions** - Admin, mentor, and user roles
- **Content Moderation** - AI-powered inappropriate content detection
- **Secure Authentication** - Supabase Auth with proper session management
- **Environment Variables** - Sensitive data not exposed in code

## 📱 **Mobile Support**

The application is fully responsive and works perfectly on:
- Desktop computers
- Tablets
- Mobile phones
- All screen sizes

## 🎨 **UI/UX Highlights**

- **Gradient Backgrounds** - Beautiful blue-to-indigo gradients
- **Glass-morphism Cards** - Semi-transparent cards with backdrop blur
- **Smooth Animations** - Hover effects and transitions
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - User-friendly error messages
- **Success Notifications** - Toast notifications for actions

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🎉 **Success!**

Your U-Fresher application is now ready for production! Students can:
- Join college communities
- Participate in clubs
- Create and view posts
- Chat in real-time
- Connect with mentors
- Enjoy a beautiful, responsive interface

Happy coding! 🚀