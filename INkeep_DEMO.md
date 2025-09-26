# 🎯 Inkeep Integration Demo for Squish

## 🚀 **What We've Built**

### **✅ Inkeep AI Concierge Widget**
- **Floating chat button** in bottom-right corner
- **Trained with Squish-specific FAQs** about meditation
- **Custom actions** to start sessions and set durations
- **Seamless integration** with existing voice AI

### **🔗 How It Works**

1. **User lands on homepage** → Inkeep widget appears
2. **User clicks "Ask Squish"** → Chat interface opens
3. **User asks questions** like:
   - "What is Squish?"
   - "How do I start a meditation session?"
   - "What should I expect from voice meditation?"
4. **Inkeep responds** with helpful answers
5. **User clicks "Start 10-minute session"** → Auto-launches Vapi voice AI

### **🎬 Demo Flow**

```bash
# 1. Start the app
pnpm dev

# 2. Go to http://localhost:3000
# 3. Look for the "Ask Squish" button in bottom-right
# 4. Click it and try these questions:

"What is Squish?"
"How do I start a meditation session?"
"What are the 3 inner senses?"
"Start a 10-minute meditation session"
```

### **🔧 Technical Implementation**

#### **InkeepWidget.tsx**
- Loads Inkeep CDN script
- Configures chat button and custom actions
- Trains with meditation-specific FAQs
- Dispatches custom events for session control

#### **VoicePanel.tsx**
- Listens for Inkeep custom events
- Auto-starts sessions when triggered
- Sets duration based on Inkeep commands
- Maintains existing voice AI functionality

#### **Homepage Integration**
- Includes InkeepWidget component
- Handles custom action events
- Seamless user experience

### **🎯 Sponsor Value**

**"Judges will see Inkeep actively helping users discover and use voice meditation features, demonstrating clear sponsor integration and user value."**

### **📱 User Experience**

1. **Discovery** - Inkeep explains what Squish is
2. **Guidance** - Helps users understand how to start
3. **Action** - Directly triggers voice sessions
4. **Support** - Answers questions about meditation

### **🚀 Next Steps**

1. **Get Inkeep API Key** from https://inkeep.com
2. **Add to .env.local**: `NEXT_PUBLIC_INKEEP_API_KEY=your_key_here`
3. **Test the integration** with real API key
4. **Customize branding** and responses
5. **Add more advanced actions** and FAQs

### **💡 Demo Script for Judges**

1. **Show homepage** with Inkeep widget
2. **Click "Ask Squish"** to open chat
3. **Ask "What is Squish?"** - see helpful response
4. **Ask "Start a 10-minute session"** - watch auto-launch
5. **Experience seamless** voice meditation session

**"Inkeep transforms Squish from a mysterious voice app into an approachable, guided meditation experience!"** 🎊
