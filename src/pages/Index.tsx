import { PerlinAura } from "@/components/PerlinAura";
import { Controls } from "@/components/Controls";
import { SentimentIndicator } from "@/components/SentimentIndicator";
import { KeywordsDisplay } from "@/components/KeywordsDisplay";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { VerticalSentimentIndicator } from "@/components/VerticalSentimentIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader } from "@/components/Loader";
import { useAudioTranscription } from "@/hooks/useAudioTranscription";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const { state, startRecording, stopRecording } = useAudioTranscription();

  const toggleRecording = () => {
    if (state.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Show loader when recording but not yet connected to Deepgram
  const showLoader = state.isRecording && !state.isConnected;

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Loader overlay - shows until Deepgram connection is established */}
      <AnimatePresence>
        {showLoader && (
          <Loader message={state.connectionStatus} />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-5xl mx-auto px-[19.2px] py-8">
        {/* Header - Centered as earlier version */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative mb-6"
        >
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Sentiment Aura
          </h1>
          <p className="text-lg text-muted-foreground">
            Real-time AI-powered emotional visualization
          </p>

          <div className="mt-4 flex justify-center gap-4 text-sm flex-wrap">
            <div
              className={`px-4 py-2 rounded-lg ${
                state.connectionStatus.includes("Connected") || state.connectionStatus.includes("Recording")
                  ? "bg-green-500/20 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                  : state.connectionStatus.includes("Error") ||
                    state.connectionStatus.includes("Failed")
                  ? "bg-red-500/20 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                  : "bg-gray-500/20 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400"
              }`}
            >
              Status: {state.connectionStatus}
            </div>

            {state.error && (
              <div className="px-4 py-2 rounded-lg bg-red-500/20 dark:bg-red-500/20 text-red-600 dark:text-red-400 max-w-md">
                Error: {state.error}
              </div>
            )}
          </div>
        </motion.header>

        {/* Grid: Transcript (70% width), Controls (30% width, 30% height), Keywords (30% width, 70% height) */}
        <div className="grid grid-cols-10 gap-6 mb-6">
          <div className="col-span-6 h-full">
            <TranscriptDisplay transcript={state.transcript} />
          </div>
          <div className="col-span-4 flex flex-col h-full gap-6">
            <div className="flex-[0.3] min-h-0">
              <Controls
                isRecording={state.isRecording}
                onToggleRecording={toggleRecording}
              />
            </div>
            <div className="flex-[0.7] min-h-0">
              <KeywordsDisplay keywords={state.keywords} />
            </div>
          </div>
        </div>

        {/* Perlin Noise Visualization in a Box with Vertical Indicator */}
        <div className="flex gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-card/40 border border-border/30 rounded-2xl p-6 shadow-2xl overflow-hidden flex-1"
          >
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              Sentiment Visualization
            </h2>
            <div className="w-full h-96 rounded-xl overflow-hidden">
              <PerlinAura sentiment={state.sentiment} keywords={state.keywords} transcript={state.transcript} />
            </div>
          </motion.div>
          
          {/* Vertical Sentiment Indicator - Outside the visualization box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="backdrop-blur-xl bg-card/40 border border-border/30 rounded-2xl p-6 shadow-2xl overflow-hidden"
          >
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider text-center">
              Sentiment
            </h2>
            <VerticalSentimentIndicator sentiment={state.sentiment} transcript={state.transcript} />
          </motion.div>
        </div>

        {/* Bottom Sentiment Indicator */}
        {/* <div className="flex justify-center">
          <SentimentIndicator sentiment={state.sentiment} />
        </div> */}
      </div>
    </div>
  );
};

export default Index;
