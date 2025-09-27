# 🧘 Squish - AI Voice Meditation App

A modern, web-based meditation application that uses AI voice technology to guide users through personalized meditation sessions. Built with Next.js, Supabase, and Vapi AI.

![Squish App](https://img.shields.io/badge/Status-Live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## 🌟 Features

### Core Functionality
- **AI Voice Meditation**: Interactive voice-guided meditation sessions using Vapi AI
- **Flexible Session Lengths**: Choose from 5, 10, 15, or 20-minute sessions
- **Real-time Conversation**: Chat with your AI meditation guide during sessions
- **Auto-scrolling Transcript**: See your conversation history in real-time
- **Speaking Indicators**: Visual feedback when the AI is speaking

### User Experience
- **Magic Link Authentication**: Secure email-based login with Supabase
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Professional Landing Page**: Modern UI with testimonials and feature highlights
- **AI Concierge**: Inkeep widget for instant help and support
- **Image Fallbacks**: Graceful handling of missing images with CSS alternatives

### Technical Features
- **Web-based**: No app downloads required - runs entirely in the browser
- **Real-time Voice Processing**: Uses browser microphone for voice interaction
- **Session Management**: Track and manage meditation sessions
- **Error Handling**: Robust error handling with user-friendly messages
- **Auto-cleanup**: Proper cleanup of voice sessions and resources

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management and side effects

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication (email magic links)
  - Real-time subscriptions
  - Row Level Security (RLS)

### AI & Voice
- **Vapi AI** - Voice AI platform
  - Web SDK for browser-based voice calls
  - Real-time speech-to-text and text-to-speech
  - Custom AI assistant configuration
  - Conversation management

### Additional Services
- **Inkeep** - AI concierge widget for user support
- **Vercel** - Deployment platform (optional)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Vapi AI account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PavloSernetskyi/squish.git
   cd squish
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # Vapi AI Configuration
   VAPI_API_KEY=your_vapi_api_key_here
   VAPI_ASSISTANT_ID=your_vapi_assistant_id_here
   VAPI_PUBLIC_KEY=your_vapi_public_key_here

   # Inkeep AI Concierge Configuration
   NEXT_PUBLIC_INKEEP_API_KEY=your_inkeep_api_key_here
   ```

4. **Set up Supabase database**
   ```sql
   -- Run this SQL in your Supabase SQL editor
   -- (See supabase/schema.sql for the complete schema)
   ```

5. **Configure Vapi AI**
   - Create a Vapi account
   - Set up an assistant with meditation-focused prompts
   - Configure web SDK settings
   - Add your domain to allowed origins

6. **Start the development server**
   ```bash
   pnpm dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
squish/
├── src/
│   ├── app/
│   │   ├── (site)/
│   │   │   ├── page.tsx          # Landing page
│   │   │   └── voice/
│   │   │       └── page.tsx      # Voice session page
│   │   ├── api/
│   │   │   └── vapi/
│   │   │       ├── token/
│   │   │       │   └── route.ts  # Vapi API endpoint
│   │   │       └── webhook/
│   │   │           └── route.ts  # Vapi webhook handler
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── AuthButtons.tsx       # Authentication component
│   │   ├── VoicePanel.tsx        # Voice session interface
│   │   └── InkeepWidget.tsx      # AI concierge widget
│   └── lib/
│       ├── supabase-client.ts    # Supabase browser client
│       └── supabase-server.ts    # Supabase server client
├── public/
│   ├── squish_logo.png          # App logo
│   ├── testimonial.png          # Testimonials image
│   └── meditation-hero.jpg      # Hero section image
├── supabase/
│   └── schema.sql               # Database schema
├── .env.local.example          # Environment variables template
├── package.json
└── README.md
```

## 🎯 How It Works

### User Flow
1. **Landing Page**: Users see the professional landing page with features and testimonials
2. **Authentication**: Users sign in with email magic links via Supabase
3. **Session Selection**: Choose meditation duration (5-20 minutes)
4. **Voice Session**: Start AI-guided meditation with real-time voice interaction
5. **Conversation**: Chat with the AI guide and see transcript in real-time
6. **Session End**: Clean session termination with proper cleanup

### Technical Flow
1. **Frontend**: React components handle UI and user interactions
2. **Authentication**: Supabase handles secure user authentication
3. **Voice AI**: Vapi SDK manages voice calls and AI responses
4. **Database**: Supabase stores user data and session information
5. **Real-time**: WebSocket connections for live voice processing

## 🔧 Configuration

### Vapi AI Setup
1. Create a Vapi account and assistant
2. Configure the assistant with meditation-focused system prompts
3. Set up web SDK with proper CORS settings
4. Add your domain to allowed origins

### Supabase Setup
1. Create a new Supabase project
2. Run the provided SQL schema
3. Enable email authentication
4. Configure RLS policies

### Inkeep Setup
1. Create an Inkeep account
2. Configure the widget with meditation FAQs
3. Set up custom actions for session management

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Static site deployment
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment

## 🧪 Testing

### Manual Testing
1. Test authentication flow with different email addresses
2. Verify voice sessions work across different browsers
3. Test responsive design on various screen sizes
4. Validate error handling and edge cases

### Automated Testing
```bash
# Run type checking
pnpm run type-check

# Run linting
pnpm run lint

# Run build test
pnpm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vapi AI** - Voice AI platform
- **Supabase** - Backend and database services
- **Inkeep** - AI concierge widget
- **Next.js** - React framework
- **Tailwind CSS** - Styling framework

## 📞 Support

For support, email support@squish.app or join our Discord community.

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced meditation analytics
- [ ] Group meditation sessions
- [ ] Custom meditation themes
- [ ] Integration with wearable devices
- [ ] Multi-language support

---

**Built with ❤️ for better mental health**