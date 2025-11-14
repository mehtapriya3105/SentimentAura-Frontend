import { motion, AnimatePresence } from 'framer-motion';

interface KeywordsDisplayProps {
  keywords: string[];
}

export const KeywordsDisplay = ({ keywords }: KeywordsDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-card/40 dark:bg-card/40 border border-border/30 rounded-2xl p-6 shadow-2xl h-full flex flex-col"
    >
      <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
        Key Topics
      </h2>
      <div className="flex flex-wrap gap-3 flex-1 min-h-[100px]">
        <AnimatePresence mode="popLayout">
          {keywords.length === 0 ? (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground/50 text-sm italic"
            >
              No keywords detected yet...
            </motion.p>
          ) : (
            keywords.map((keyword, index) => (
              <motion.span
                key={`${keyword}-${index}`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: {
                    delay: index * 0.05,
                    duration: 0.4,
                    ease: [0.23, 1, 0.32, 1]
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8,
                  transition: { duration: 0.2 }
                }}
                className="px-4 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border border-primary/20 dark:border-primary/30 rounded-lg text-sm font-semibold text-primary dark:text-primary-foreground backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                {keyword}
              </motion.span>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
