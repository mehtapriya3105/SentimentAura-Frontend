# Sentiment Aura Frontend

React + TypeScript frontend for the Sentiment Aura application. Features real-time audio transcription, sentiment analysis, and beautiful Perlin noise visualizations.

## Project Structure

```
src/
├── components/          # React components
│   ├── PerlinAura.tsx   # p5.js visualization component
│   ├── Controls.tsx     # Start/Stop recording controls
│   ├── TranscriptDisplay.tsx  # Live transcript display
│   ├── KeywordsDisplay.tsx   # Keywords with fade-in animations
│   └── SentimentIndicator.tsx # Sentiment visualization
├── hooks/
│   └── useAudioTranscription.ts  # Custom hook for audio/WebSocket management
├── services/
│   └── api.ts           # API service layer (backend calls)
└── pages/
    └── Index.tsx        # Main page component
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults to `http://localhost:4000`):
```bash
VITE_API_URL=http://localhost:4000
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080` (or the port specified in `vite.config.ts`)

## How It Works

### Data Flow

1. **User clicks "Start Recording"**
   - Frontend requests microphone access
   - Calls `/api/get-deepgram-url` to get WebSocket URL
   - Opens WebSocket connection to Deepgram
   - Starts streaming audio via MediaRecorder

2. **Deepgram streams transcriptions**
   - WebSocket receives real-time transcription JSON
   - When `is_final: true`, text is added to transcript

3. **Text processing**
   - Frontend calls `/process_text` with the final transcript
   - Backend uses OpenAI to extract sentiment and keywords
   - Returns structured JSON: `{ sentiment: number, keywords: string[] }`

4. **Visualization updates**
   - PerlinAura component receives new sentiment/keywords
   - Updates visualization colors, particles, and emoji effects
   - Keywords fade in gracefully one by one

### Key Components

- **`useAudioTranscription` hook**: Manages all WebSocket and audio recording logic
- **`api.ts` service**: Centralized API calls to backend
- **`PerlinAura`**: p5.js canvas with Perlin noise field visualization
- **`KeywordsDisplay`**: Animated keyword tags with fade-in effects

## Architecture Improvements

The frontend has been refactored for better organization:

- ✅ Separated API calls into service layer
- ✅ Extracted WebSocket/audio logic into custom hook
- ✅ Clean component structure with single responsibilities
- ✅ Proper error handling and connection status tracking
- ✅ TypeScript types for all API responses

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: `http://localhost:4000`)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

