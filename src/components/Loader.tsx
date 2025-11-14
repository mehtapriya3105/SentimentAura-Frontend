import { motion } from 'framer-motion';

interface LoaderProps {
  message?: string;
}

export const Loader = ({ message = "Connecting to Deepgram..." }: LoaderProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
      >
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Spinner */}
          <div className="relative w-16 h-16">
            <motion.div
              className="absolute inset-0 border-4 border-primary/20 rounded-full"
            />
            <motion.div
              className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          {/* Message */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Establishing Connection
            </h3>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

