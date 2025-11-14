# Sentiment Aura - Frontend

A stunning real-time AI-powered sentiment visualization application built with React, TypeScript, and p5.js.

## 🎨 Features

- **Real-time Perlin Noise Visualization**: Beautiful, fluid generative art that responds to sentiment
- **Live Transcript Display**: Auto-scrolling transcript with smooth animations
- **Animated Keywords**: Elegant fade-in effects for detected keywords
- **Sentiment Indicator**: Visual representation of emotional tone
- **Glassmorphic UI**: Modern, semi-transparent panels with backdrop blur
- **Responsive Design**: Works seamlessly on desktop and laptop

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **p5.js** - Generative art visualization
- **Framer Motion** - Smooth animations
- **Tailwind CSS** - Styling with semantic design tokens
- **Vite** - Build tool

## 📦 Project Structure

```
src/
├── components/
│   ├── PerlinAura.tsx          # Perlin noise visualization
│   ├── TranscriptDisplay.tsx   # Live transcript with auto-scroll
│   ├── KeywordsDisplay.tsx     # Animated keywords display
│   ├── Controls.tsx            # Start/Stop recording controls
│   └── SentimentIndicator.tsx  # Sentiment visualization
├── pages/
│   └── Index.tsx               # Main application page
└── index.css                   # Design system tokens
```

## 🎯 Design System

All colors and styles are defined using semantic tokens in `src/index.css`:

- **Primary Colors**: Purple accent (`--primary`)
- **Accent Colors**: Cyan (`--accent`)
- **Sentiment Colors**:
  - Positive: Green (`--sentiment-positive`)
  - Neutral: Cyan (`--sentiment-neutral`)
  - Negative: Pink/Red (`--sentiment-negative`)

## 🔌 Backend Integration Points

Currently, the app includes a demo mode. To connect to the real backend:

### 1. WebSocket Connection (Deepgram)
In `src/pages/Index.tsx`, replace the demo code with:

```typescript
// Connect to Deepgram WebSocket
const ws = new WebSocket('wss://api.deepgram.com/v1/listen', [
  'token',
  YOUR_DEEPGRAM_API_KEY
]);

// Stream audio
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      ws.send(event.data);
    };
  });
```

### 2. Backend API Call
When receiving `is_final: true` transcripts:

```typescript
const response = await fetch('YOUR_BACKEND_URL/process_text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: transcriptText })
});

const { sentiment, keywords } = await response.json();
setSentiment(sentiment);
setKeywords(keywords);
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🎨 Customization

### Modify Perlin Noise Behavior
Edit `src/components/PerlinAura.tsx`:
- Adjust particle count (line 91)
- Modify noise parameters (lines 36-38)
- Change color interpolation (lines 64-84)

### Adjust Animation Timing
Edit `src/components/KeywordsDisplay.tsx`:
- Change fade-in delay (line 36)
- Modify animation duration (line 37)
- Update easing function (line 38)

## 📝 Notes

- The Perlin noise visualization automatically adjusts to viewport size
- Keywords fade in with staggered timing for elegant entrance
- Transcript auto-scrolls to show latest content
- All animations use hardware-accelerated CSS transforms

## 🔮 Future Enhancements

- [ ] Connect to real Deepgram WebSocket
- [ ] Integrate backend API for sentiment analysis
- [ ] Add microphone permission handling
- [ ] Implement error states and reconnection logic
- [ ] Add audio level visualization
- [ ] Export transcript functionality
