import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const Controls = ({ isRecording, onToggleRecording }: ControlsProps) => {
  const handleRecordingClick = () => {
    onToggleRecording();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-card/40 border border-border/30 rounded-2xl p-4 shadow-2xl h-full flex flex-col justify-center"
    >
      <div className="flex flex-col items-center justify-center gap-2 w-full">
        <Button
          onClick={handleRecordingClick}
          size="lg"
          className={`
            relative overflow-hidden rounded-full px-8 py-6 text-lg font-semibold
            transition-all duration-300 shadow-xl
            ${isRecording 
              ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }
          `}
        >
          <span className="flex items-center gap-3">
            {isRecording ? (
              <>
                <MicOff className="w-6 h-6" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" />
                Start Recording
              </>
            )}
          </span>
        </Button>

        <div className="flex items-center justify-center gap-3 w-full">
          <motion.div
            animate={{
              scale: isRecording ? [1, 1.2, 1] : 1,
              opacity: isRecording ? [0.5, 1, 0.5] : 0.3,
            }}
            transition={{
              duration: 2,
              repeat: isRecording ? Infinity : 0,
              ease: "easeInOut",
            }}
            className={`
              w-3 h-3 rounded-full
              ${isRecording ? 'bg-destructive' : 'bg-muted-foreground'}
            `}
          />
          <span className="text-sm font-medium text-muted-foreground text-center">
            {isRecording ? 'Recording...' : 'Ready'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
