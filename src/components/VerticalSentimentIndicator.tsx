import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { motion } from 'framer-motion';

interface SpeechSegment {
  text: string;
  sentiment: number;
}

interface VerticalSentimentIndicatorProps {
  sentiment: number; // -1 to 1
  transcript: string[]; // Array of transcript segments
}

export const VerticalSentimentIndicator = ({ sentiment, transcript }: VerticalSentimentIndicatorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const sentimentRef = useRef(sentiment);
  const transcriptRef = useRef(transcript);
  const speechSegmentsRef = useRef<SpeechSegment[]>([]);

  // Update refs when props change
  useEffect(() => {
    sentimentRef.current = sentiment;
    transcriptRef.current = transcript;
    
    // Build speech segments with sentiment (same logic as PerlinAura)
    if (transcript.length > speechSegmentsRef.current.length) {
      const newSegments = transcript.slice(speechSegmentsRef.current.length);
      newSegments.forEach(text => {
        speechSegmentsRef.current.push({
          text,
          sentiment: sentimentRef.current
        });
      });
    }
  }, [sentiment, transcript]);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      // Smooth interpolation variables for emoji position
      // Initialize with current sentiment from ref (set by useEffect)
      let targetSentiment = sentimentRef.current || 0;
      let currentDisplaySentiment = sentimentRef.current || 0;
      let pointerPosition = 0; // 0 to 1, tracks position along the speech timeline
      
      // Function to get sentiment at a specific position (same as PerlinAura)
      function getSentimentAtPosition(pos: number): number {
        const segments = speechSegmentsRef.current;
        if (segments.length === 0) return sentimentRef.current;
        
        // Map position (0-1) to segment index with smooth interpolation
        const exactIndex = pos * segments.length;
        const lowerIndex = Math.floor(exactIndex);
        const upperIndex = Math.ceil(exactIndex);
        const t = exactIndex - lowerIndex;
        
        const lowerSentiment = segments[p.constrain(lowerIndex, 0, segments.length - 1)]?.sentiment || 0;
        const upperSentiment = segments[p.constrain(upperIndex, 0, segments.length - 1)]?.sentiment || 0;
        
        // Interpolate between adjacent segments for smooth transitions
        return p.lerp(lowerSentiment, upperSentiment, t);
      }
      
      // Sentiment color palette
      const sentimentColors = {
        veryPositive: { r: 34, g: 197, b: 94 },    // #22c55e - Green
        positive: { r: 6, g: 182, b: 212 },       // #06b6d4 - Cyan
        neutral: { r: 234, g: 179, b: 8 },        // #eab308 - Yellow
        negative: { r: 249, g: 115, b: 22 },      // #f97316 - Orange
        veryNegative: { r: 225, g: 29, b: 72 },   // #e11d48 - Rose
      };

      function getSentimentColor(sent: number) {
        // Map sentiment to color with smooth transitions
        if (sent > 0.6) {
          // Very Positive: Green
          const t = (sent - 0.6) / 0.4;
          return {
            r: p.lerp(sentimentColors.positive.r, sentimentColors.veryPositive.r, t),
            g: p.lerp(sentimentColors.positive.g, sentimentColors.veryPositive.g, t),
            b: p.lerp(sentimentColors.positive.b, sentimentColors.veryPositive.b, t),
          };
        } else if (sent > 0.2) {
          // Positive: Cyan to Green
          const t = (sent - 0.2) / 0.4;
          return {
            r: p.lerp(sentimentColors.neutral.r, sentimentColors.positive.r, t),
            g: p.lerp(sentimentColors.neutral.g, sentimentColors.positive.g, t),
            b: p.lerp(sentimentColors.neutral.b, sentimentColors.positive.b, t),
          };
        } else if (sent > -0.2) {
          // Neutral: Yellow
          const t = (sent + 0.2) / 0.4;
          return {
            r: p.lerp(sentimentColors.negative.r, sentimentColors.neutral.r, t),
            g: p.lerp(sentimentColors.negative.g, sentimentColors.neutral.g, t),
            b: p.lerp(sentimentColors.negative.b, sentimentColors.neutral.b, t),
          };
        } else if (sent > -0.6) {
          // Negative: Orange
          const t = (sent + 0.6) / 0.4;
          return {
            r: p.lerp(sentimentColors.veryNegative.r, sentimentColors.negative.r, t),
            g: p.lerp(sentimentColors.veryNegative.g, sentimentColors.negative.g, t),
            b: p.lerp(sentimentColors.veryNegative.b, sentimentColors.negative.b, t),
          };
        } else {
          // Very Negative: Rose
          const t = (sent + 1) / 0.4;
          return {
            r: p.lerp(180, sentimentColors.veryNegative.r, t),
            g: p.lerp(20, sentimentColors.veryNegative.g, t),
            b: p.lerp(40, sentimentColors.veryNegative.b, t),
          };
        }
      }

      // Function to get emoji based on sentiment
      function getSentimentEmoji(sent: number): string {
        if (sent > 0.6) return '😄';      // Very Positive - big smile
        if (sent > 0.2) return '🙂';      // Positive - smile
        if (sent > -0.2) return '😐';    // Neutral - neutral
        if (sent > -0.6) return '😕';    // Negative - slight frown
        return '😢';                       // Very Negative - crying
      }

      p.setup = () => {
        const containerWidth = containerRef.current?.clientWidth || 64;
        const containerHeight = containerRef.current?.clientHeight || 400;
        p.createCanvas(containerWidth, containerHeight);
        p.colorMode(p.RGB, 255, 255, 255, 255);
      };

      p.draw = () => {
        // Theme-aware background
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
          p.background(10, 12, 18); // Dark background
        } else {
          p.background(250, 250, 252); // Light background
        }
        
        const segments = speechSegmentsRef.current;
        const segmentsCount = segments.length;
        
        // Update pointer position - moves forward as speech progresses (for visual tracking only)
        if (segmentsCount > 0) {
          const targetPosition = segmentsCount / Math.max(segmentsCount + 5, 10);
          pointerPosition += (targetPosition - pointerPosition) * 0.05;
          pointerPosition = p.constrain(pointerPosition, 0, 1);
        } else {
          pointerPosition = 0;
        }
        
        // Use CURRENT sentiment (like the bottom SentimentIndicator component)
        // NOT the sentiment at pointer position - we want to show current overall sentiment
        targetSentiment = sentimentRef.current;
        
        // Smoothly interpolate current display sentiment towards target
        // Using lerp factor of 0.1 to match visualization pointer interpolation speed
        currentDisplaySentiment = p.lerp(currentDisplaySentiment, targetSentiment, 0.1);
        
        const indicatorWidth = p.width * 0.8;
        const indicatorHeight = p.height * 0.85;
        const indicatorX = (p.width - indicatorWidth) / 2;
        const indicatorY = p.height * 0.075;
        
        // Draw sentiment scale background (vertical gradient)
        p.noStroke();
        for (let i = 0; i <= 100; i++) {
          const y = indicatorY + (i / 100) * indicatorHeight;
          const normalizedPos = 1 - (i / 100); // 1 at top (very positive), 0 at bottom (very negative)
          const sentValue = p.map(normalizedPos, 0, 1, -1, 1);
          const scaleColor = getSentimentColor(sentValue);
          
          p.fill(scaleColor.r, scaleColor.g, scaleColor.b, 150);
          p.rect(indicatorX, y, indicatorWidth, indicatorHeight / 100);
        }
        
        // Draw moving emoji based on smoothly interpolated sentiment
        // Map sentiment (-1 to 1) to vertical position (bottom to top)
        const emojiY = p.map(currentDisplaySentiment, -1, 1, indicatorY + indicatorHeight - 25, indicatorY + 25);
        const emojiColor = getSentimentColor(currentDisplaySentiment);
        const emoji = getSentimentEmoji(currentDisplaySentiment);
        
        // Draw emoji background circle with glow
        p.fill(emojiColor.r, emojiColor.g, emojiColor.b, 60);
        p.circle(p.width / 2, emojiY, 55);
        
        p.fill(emojiColor.r, emojiColor.g, emojiColor.b, 220);
        p.circle(p.width / 2, emojiY, 45);
        
        // Draw emoji text
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(32);
        p.fill(255, 255, 255, 255);
        p.text(emoji, p.width / 2, emojiY);
      };

      p.windowResized = () => {
        const containerWidth = containerRef.current?.clientWidth || 64;
        const containerHeight = containerRef.current?.clientHeight || 400;
        p.resizeCanvas(containerWidth, containerHeight);
      };
    };

    p5InstanceRef.current = new p5(sketch, containerRef.current);

    return () => {
      p5InstanceRef.current?.remove();
      p5InstanceRef.current = null;
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-16 h-96 rounded-xl overflow-hidden"
    />
  );
};

