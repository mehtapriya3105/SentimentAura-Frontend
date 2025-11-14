import { motion } from 'framer-motion';
import { Smile, Meh, Frown, Laugh, Angry } from 'lucide-react';

interface SentimentIndicatorProps {
  sentiment: number; // -1 to 1
}

export const SentimentIndicator = ({ sentiment }: SentimentIndicatorProps) => {
  const getSentimentLabel = () => {
    if (sentiment > 0.6) return 'Very Positive';
    if (sentiment > 0.2) return 'Positive';
    if (sentiment < -0.6) return 'Very Negative';
    if (sentiment < -0.2) return 'Negative';
    return 'Neutral';
  };

  const getSentimentIcon = () => {
    if (sentiment > 0.6) return <Laugh className="w-6 h-6" />;
    if (sentiment > 0.2) return <Smile className="w-6 h-6" />;
    if (sentiment < -0.6) return <Angry className="w-6 h-6" />;
    if (sentiment < -0.2) return <Frown className="w-6 h-6" />;
    return <Meh className="w-6 h-6" />;
  };

  const getSentimentColor = () => {
    if (sentiment > 0.6) return 'text-green-500';
    if (sentiment > 0.2) return 'text-sentiment-positive';
    if (sentiment < -0.6) return 'text-red-600';
    if (sentiment < -0.2) return 'text-sentiment-negative';
    return 'text-sentiment-neutral';
  };

  const getSentimentBarColor = () => {
    if (sentiment > 0.6) return 'bg-green-500';
    if (sentiment > 0.2) return 'bg-sentiment-positive';
    if (sentiment < -0.6) return 'bg-red-600';
    if (sentiment < -0.2) return 'bg-sentiment-negative';
    return 'bg-sentiment-neutral';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-card/40 border border-border/30 rounded-2xl p-6 shadow-2xl"
    >
      <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
        Sentiment
      </h2>
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={getSentimentColor()}
        >
          {getSentimentIcon()}
        </motion.div>
        <div className="flex-1">
          <p className={`text-lg font-semibold ${getSentimentColor()}`}>
            {getSentimentLabel()}
          </p>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${((sentiment + 1) / 2) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full ${getSentimentBarColor()}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
