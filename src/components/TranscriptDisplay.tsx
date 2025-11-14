import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TranscriptDisplayProps {
  transcript: string[];
}

export const TranscriptDisplay = ({ transcript }: TranscriptDisplayProps) => {
  console.log('transcript', transcript);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-card/40 border border-border/30 rounded-2xl p-6 shadow-2xl h-full flex flex-col"
    >
      <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
        Live Transcript
      </h2>
      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
      >
        {transcript.length === 0 ? (
          <p className="text-muted-foreground/50 text-sm italic">
            Waiting for speech...
          </p>
        ) : (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.05 }}
            className="text-foreground text-base leading-relaxed whitespace-normal"
          >
            {transcript.join(' ')}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};
