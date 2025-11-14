import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface KeywordsDisplayProps {
  keywords: string[];
  sentiment?: number; // -1 to 1
}

export const KeywordsDisplay = ({ keywords, sentiment = 0 }: KeywordsDisplayProps) => {
  const previousKeywordsRef = useRef<string[]>([]);
  const [newKeywords, setNewKeywords] = useState<Set<string>>(new Set());

  // Track which keywords are new
  useEffect(() => {
    const newSet = new Set<string>();
    keywords.forEach(keyword => {
      if (!previousKeywordsRef.current.includes(keyword)) {
        newSet.add(keyword);
      }
    });
    setNewKeywords(newSet);
    previousKeywordsRef.current = keywords;
    // Clear new keywords after animation completes
    const timer = setTimeout(() => {
      setNewKeywords(new Set());
    }, 2000);
    return () => clearTimeout(timer);
  }, [keywords]);

  // Calculate keyword frequency for visual hierarchy
  const getKeywordFrequency = (keyword: string): number => {
    return keywords.filter(k => k === keyword).length;
  };

  // Get sentiment-based color classes matching the visualization color scale
  const getSentimentColorClasses = (sent: number) => {
    // Match the exact color scale from PerlinAura:
    // Very Positive (>0.6): Green (#22c55e)
    // Positive (0.2 to 0.6): Cyan (#06b6d4)
    // Neutral (-0.2 to 0.2): Yellow (#eab308)
    // Negative (-0.6 to -0.2): Orange (#f97316)
    // Very Negative (<-0.6): Rose (#e11d48)
    
    if (sent > 0.6) {
      // Very Positive: Green
      return {
        gradient: 'from-green-500/20 to-green-400/20 dark:from-green-500/30 dark:to-green-400/30',
        border: 'border-green-500/40 dark:border-green-400/50',
        borderImportant: 'border-green-500/50 dark:border-green-400/60',
        text: 'text-green-600 dark:text-green-400',
        ring: 'ring-green-500/30 dark:ring-green-400/40',
        glow: 'bg-green-500/10 dark:bg-green-400/20'
      };
    } else if (sent > 0.2) {
      // Positive: Cyan
      return {
        gradient: 'from-cyan-500/20 to-cyan-400/20 dark:from-cyan-500/30 dark:to-cyan-400/30',
        border: 'border-cyan-500/40 dark:border-cyan-400/50',
        borderImportant: 'border-cyan-500/50 dark:border-cyan-400/60',
        text: 'text-cyan-600 dark:text-cyan-400',
        ring: 'ring-cyan-500/30 dark:ring-cyan-400/40',
        glow: 'bg-cyan-500/10 dark:bg-cyan-400/20'
      };
    } else if (sent > -0.2) {
      // Neutral: Yellow
      return {
        gradient: 'from-yellow-500/20 to-yellow-400/20 dark:from-yellow-500/30 dark:to-yellow-400/30',
        border: 'border-yellow-500/40 dark:border-yellow-400/50',
        borderImportant: 'border-yellow-500/50 dark:border-yellow-400/60',
        text: 'text-yellow-600 dark:text-yellow-400',
        ring: 'ring-yellow-500/30 dark:ring-yellow-400/40',
        glow: 'bg-yellow-500/10 dark:bg-yellow-400/20'
      };
    } else if (sent > -0.6) {
      // Negative: Orange
      return {
        gradient: 'from-orange-500/20 to-orange-400/20 dark:from-orange-500/30 dark:to-orange-400/30',
        border: 'border-orange-500/40 dark:border-orange-400/50',
        borderImportant: 'border-orange-500/50 dark:border-orange-400/60',
        text: 'text-orange-600 dark:text-orange-400',
        ring: 'ring-orange-500/30 dark:ring-orange-400/40',
        glow: 'bg-orange-500/10 dark:bg-orange-400/20'
      };
    } else {
      // Very Negative: Rose
      return {
        gradient: 'from-rose-500/20 to-rose-400/20 dark:from-rose-500/30 dark:to-rose-400/30',
        border: 'border-rose-500/40 dark:border-rose-400/50',
        borderImportant: 'border-rose-500/50 dark:border-rose-400/60',
        text: 'text-rose-600 dark:text-rose-400',
        ring: 'ring-rose-500/30 dark:ring-rose-400/40',
        glow: 'bg-rose-500/10 dark:bg-rose-400/20'
      };
    }
  };

  const colorClasses = getSentimentColorClasses(sentiment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-card/40 dark:bg-card/40 border border-border/30 rounded-2xl p-6 shadow-2xl h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Key Topics
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-muted-foreground/60 hover:text-muted-foreground cursor-help transition-colors" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Important keywords and topics extracted from your speech</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-wrap gap-3 flex-1 min-h-[100px] items-start content-start">
        <AnimatePresence mode="popLayout">
          {keywords.length === 0 ? (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-muted-foreground/50 text-sm italic"
            >
              No keywords detected yet...
            </motion.p>
          ) : (
            keywords.map((keyword, index) => {
              const isNew = newKeywords.has(keyword);
              const frequency = getKeywordFrequency(keyword);
              const isImportant = frequency > 1;
              
              // Stagger delay with exponential curve for more natural feel
              const staggerDelay = Math.min(index * 0.08 * Math.pow(1.15, index), 0.4);
              
              return (
                <motion.span
                  key={keyword} // Use keyword as key for better tracking
                  layout
                  initial={{ 
                    opacity: 0, 
                    scale: 0.6, 
                    y: 30, // Start further down for more dramatic float-up
                    rotate: isNew ? (Math.random() - 0.5) * 8 : 0, // Slight rotation for new keywords
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: isImportant ? 1.05 : 1, // Slightly larger for important keywords
                    y: 0,
                    rotate: 0,
                    transition: {
                      delay: staggerDelay,
                      duration: 0.6, // Longer duration for smoother animation
                      ease: [0.16, 1, 0.3, 1], // Custom easing for natural float-up
                      opacity: {
                        duration: 0.5,
                        ease: "easeOut"
                      },
                      scale: {
                        duration: 0.5,
                        ease: [0.34, 1.56, 0.64, 1] // Slight bounce
                      }
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.6,
                    y: -15, // Exit upward
                    transition: { 
                      duration: 0.4, // Longer exit for smoother fade
                      ease: "easeIn"
                    }
                  }}
                  whileHover={{
                    scale: 1.1,
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  className={`
                    px-4 py-2 
                    bg-gradient-to-r ${colorClasses.gradient}
                    border rounded-lg 
                    text-sm font-semibold 
                    ${colorClasses.text}
                    backdrop-blur-sm 
                    shadow-md hover:shadow-xl
                    transition-all duration-300
                    cursor-default
                    relative
                    ${isImportant ? colorClasses.borderImportant : colorClasses.border}
                    ${isNew ? `ring-2 ${colorClasses.ring}` : ''}
                  `}
                >
                  {keyword}
                  {/* Subtle glow effect for new keywords */}
                  {isNew && (
                    <motion.div
                      className={`absolute inset-0 rounded-lg ${colorClasses.glow}`}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  )}
                </motion.span>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
