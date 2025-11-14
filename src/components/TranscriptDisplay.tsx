import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Live Transcript
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-muted-foreground/60 hover:text-muted-foreground cursor-help transition-colors" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Real-time transcription of your speech as you speak</p>
          </TooltipContent>
        </Tooltip>
      </div>
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
