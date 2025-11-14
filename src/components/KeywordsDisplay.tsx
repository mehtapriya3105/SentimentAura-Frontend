import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface KeywordsDisplayProps {
  keywords: string[];
}

export const KeywordsDisplay = ({ keywords }: KeywordsDisplayProps) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-card/40 dark:bg-card/40 border border-border/30 rounded-2xl p-6 shadow-2xl h-full flex flex-col"
    >
      <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
        Key Topics
      </h2>
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
                    bg-gradient-to-r from-primary/10 to-accent/10 
                    dark:from-primary/20 dark:to-accent/20 
                    border rounded-lg 
                    text-sm font-semibold 
                    text-primary dark:text-primary-foreground 
                    backdrop-blur-sm 
                    shadow-md hover:shadow-xl
                    transition-all duration-200
                    cursor-default
                    relative
                    ${isImportant ? 'border-primary/40 dark:border-primary/50' : 'border-primary/20 dark:border-primary/30'}
                    ${isNew ? 'ring-2 ring-primary/30 dark:ring-primary/40' : ''}
                  `}
                >
                  {keyword}
                  {/* Subtle glow effect for new keywords */}
                  {isNew && (
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-primary/10 dark:bg-primary/20"
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
