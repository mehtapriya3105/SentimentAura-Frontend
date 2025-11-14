# Sentiment Aura Frontend

A modern React application for real-time speech transcription and sentiment analysis. Visualize emotional patterns in speech through beautiful, interactive visualizations.

## Features

- 🎤 **Real-time Speech Transcription**: Live audio transcription using Deepgram WebSocket API
- 💭 **Sentiment Analysis**: Real-time sentiment analysis of transcribed speech (-1 to 1 scale)
- 🔑 **Keyword Extraction**: Automatic extraction of key topics from speech
- 📊 **Interactive Visualizations**: 
  - Perlin noise-based sentiment visualization
  - Vertical sentiment meter with emoji indicators
  - Real-time transcript display
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 🌓 **Dark Mode**: Theme toggle for light/dark mode
- 📱 **Responsive Design**: Works seamlessly across different screen sizes

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Framer Motion** - Animations
- **p5.js** (via react-p5) - Canvas-based visualizations
- **React Router** - Routing
- **WebSocket API** - Real-time communication

## Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:4000` (see [backend README](../backend/README.md))

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

The frontend connects to the backend API at `http://localhost:4000` by default. To change this, update the `API_BASE_URL` in `src/services/api.ts`:

```typescript
const API_BASE_URL = "http://localhost:4000"; // Change to your backend URL
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

## Project Structure

```
src/
├── components/          # React components
│   ├── Controls.tsx    # Recording button and controls
│   ├── KeywordsDisplay.tsx  # Keyword tags display
│   ├── PerlinAura.tsx  # Sentiment visualization (p5.js)
│   ├── SentimentIndicator.tsx  # Horizontal sentiment bar
│   ├── TranscriptDisplay.tsx  # Live transcript viewer
│   ├── VerticalSentimentIndicator.tsx  # Vertical sentiment meter
│   ├── ThemeToggle.tsx  # Dark/light mode toggle
│   └── ui/            # shadcn/ui components
├── hooks/
│   └── useAudioTranscription.ts  # Main hook for audio/transcription logic
├── pages/
│   ├── Index.tsx      # Main application page
│   └── NotFound.tsx   # 404 page
├── services/
│   └── api.ts         # Backend API service functions
├── lib/
│   └── utils.ts       # Utility functions
└── main.tsx           # Application entry point
```

## Key Components

### `useAudioTranscription` Hook

The core hook that manages:
- WebSocket connection to backend
- MediaRecorder for audio capture
- Real-time transcription processing
- Sentiment and keyword extraction
- Connection state management

**Usage:**
```typescript
const { state, startRecording, stopRecording } = useAudioTranscription();

// state contains:
// - isRecording: boolean
// - connectionStatus: string
// - transcript: string[]
// - sentiment: number (-1 to 1)
// - keywords: string[]
// - error: string | null
```

### Main Components

- **Controls**: Start/stop recording button with status indicator
- **TranscriptDisplay**: Scrollable transcript viewer with auto-scroll
- **KeywordsDisplay**: Animated keyword tags with gradient styling
- **PerlinAura**: Canvas-based visualization showing sentiment over time
- **VerticalSentimentIndicator**: Vertical gradient meter with emoji indicator
- **SentimentIndicator**: Horizontal sentiment bar with label

## API Integration

The frontend communicates with the backend through:

1. **WebSocket Connection** (`/ws/deepgram`):
   - Connects via backend proxy
   - Sends binary audio data
   - Receives transcription results

2. **REST API** (`/process_text`):
   - Processes transcribed text
   - Returns sentiment score and keywords

See `src/services/api.ts` for API service functions.

## Building for Production

### Development Build

```bash
npm run build:dev
```

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (may require additional permissions)

**Note**: Microphone access is required for recording functionality.

## Troubleshooting

### Microphone Permission Denied

- Ensure your browser has microphone permissions enabled
- Check browser settings for site permissions
- Try refreshing the page and granting permissions when prompted

### Connection Issues

- Verify the backend server is running on `http://localhost:4000`
- Check browser console for WebSocket connection errors
- Ensure CORS is properly configured in the backend

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check Node.js version: `node --version` (should be 18+)

## Development Tips

### Hot Module Replacement

Vite provides instant HMR. Changes to components will reflect immediately without full page reload.

### TypeScript

The project uses TypeScript for type safety. Run type checking:
```bash
npx tsc --noEmit
```

### Styling

- Tailwind CSS classes are used throughout
- Custom theme colors defined in `src/index.css`
- Dark mode handled via `next-themes`

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

### Netlify

1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

### Other Platforms

Any static hosting service that supports Node.js build processes will work. Ensure:
- Build command: `npm run build`
- Output directory: `dist`
- Node.js version: 18+

## License

This project is part of the Sentiment Aura application.
