import { useEffect, useRef } from 'react';
import p5 from 'p5';

interface SpeechSegment {
  text: string;
  sentiment: number;
}

interface PerlinAuraProps {
  sentiment: number; // -1 to 1
  keywords: string[];
  transcript: string[]; // Array of transcript segments
}

export const PerlinAura = ({ sentiment, keywords, transcript }: PerlinAuraProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const sentimentRef = useRef(sentiment);
  const keywordsRef = useRef(keywords);
  const transcriptRef = useRef(transcript);
  const speechSegmentsRef = useRef<SpeechSegment[]>([]);

  // Update refs when props change
  useEffect(() => {
    sentimentRef.current = sentiment;
    keywordsRef.current = keywords;
    transcriptRef.current = transcript;
    
    // Build speech segments with sentiment
    // Each transcript entry gets the current sentiment when it was processed
    if (transcript.length > speechSegmentsRef.current.length) {
      const newSegments = transcript.slice(speechSegmentsRef.current.length);
      newSegments.forEach(text => {
        speechSegmentsRef.current.push({
          text,
          sentiment: sentimentRef.current
        });
      });
    }
  }, [sentiment, keywords, transcript]);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let time = 0;
      let pointerPosition = 0; // 0 to 1, tracks position along the wave
      let pointerSpeed = 0.001; // Speed of pointer movement
      // Initialize with current sentiment from ref (set by useEffect)
      let currentPointerSentiment = sentimentRef.current || 0;
      let targetPointerSentiment = sentimentRef.current || 0;

      // Function to get sentiment at a specific position along the wave
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
          const t = (sent - 0.6) / 0.4; // 0.6 to 1 maps to 0 to 1
          return {
            r: p.lerp(sentimentColors.positive.r, sentimentColors.veryPositive.r, t),
            g: p.lerp(sentimentColors.positive.g, sentimentColors.veryPositive.g, t),
            b: p.lerp(sentimentColors.positive.b, sentimentColors.veryPositive.b, t),
          };
        } else if (sent > 0.2) {
          // Positive: Cyan to Green
          const t = (sent - 0.2) / 0.4; // 0.2 to 0.6 maps to 0 to 1
          return {
            r: p.lerp(sentimentColors.neutral.r, sentimentColors.positive.r, t),
            g: p.lerp(sentimentColors.neutral.g, sentimentColors.positive.g, t),
            b: p.lerp(sentimentColors.neutral.b, sentimentColors.positive.b, t),
          };
        } else if (sent > -0.2) {
          // Neutral: Yellow
          const t = (sent + 0.2) / 0.4; // -0.2 to 0.2 maps to 0 to 1
          return {
            r: p.lerp(sentimentColors.negative.r, sentimentColors.neutral.r, t),
            g: p.lerp(sentimentColors.negative.g, sentimentColors.neutral.g, t),
            b: p.lerp(sentimentColors.negative.b, sentimentColors.neutral.b, t),
          };
        } else if (sent > -0.6) {
          // Negative: Orange
          const t = (sent + 0.6) / 0.4; // -0.6 to -0.2 maps to 0 to 1
          return {
            r: p.lerp(sentimentColors.veryNegative.r, sentimentColors.negative.r, t),
            g: p.lerp(sentimentColors.veryNegative.g, sentimentColors.negative.g, t),
            b: p.lerp(sentimentColors.veryNegative.b, sentimentColors.negative.b, t),
          };
        } else {
          // Very Negative: Rose
          const t = (sent + 1) / 0.4; // -1 to -0.6 maps to 0 to 1
          return {
            r: p.lerp(180, sentimentColors.veryNegative.r, t),
            g: p.lerp(20, sentimentColors.veryNegative.g, t),
            b: p.lerp(40, sentimentColors.veryNegative.b, t),
          };
        }
      }

      p.setup = () => {
        // Create canvas to fit container
        const containerWidth = containerRef.current?.clientWidth || p.windowWidth;
        const containerHeight = containerRef.current?.clientHeight || 400;
        p.createCanvas(containerWidth, containerHeight);
        p.colorMode(p.RGB, 255, 255, 255, 255);
      };

      // Function to get emoji based on sentiment
      function getSentimentEmoji(sent: number): string {
        if (sent > 0.6) return '😄';      // Very Positive - big smile
        if (sent > 0.2) return '🙂';      // Positive - smile
        if (sent > -0.2) return '😐';    // Neutral - neutral
        if (sent > -0.6) return '😕';    // Negative - slight frown
        return '😢';                       // Very Negative - crying
      }

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
        const currentSentiment = sentimentRef.current;
        
        // Update pointer position - moves forward as speech progresses
        if (segmentsCount > 0) {
          const targetPosition = segmentsCount / Math.max(segmentsCount + 5, 10);
          pointerPosition += (targetPosition - pointerPosition) * 0.05;
          pointerPosition = p.constrain(pointerPosition, 0, 1);
        } else {
          pointerPosition = 0;
        }
        
        // Use CURRENT sentiment (like the bottom SentimentIndicator component)
        // NOT the sentiment at pointer position - we want to show current overall sentiment
        targetPointerSentiment = currentSentiment;
        
        // Always smoothly interpolate pointer sentiment for consistent display
        currentPointerSentiment = p.lerp(currentPointerSentiment, targetPointerSentiment, 0.1);
        
        time += 0.02;
        
        // Draw vertical bars (equalizer style) - all exactly same width
        const numBars = 200; // Number of vertical bars
        const totalWidth = p.width;
        const barSpacing = totalWidth / numBars;
        const centerY = p.height / 2;
        // Calculate fixed width ONCE - all bars use this exact same value
        const fixedBarWidth = Math.floor(barSpacing * 0.9); // Fixed width for ALL bars (90% of spacing, rounded down)
        
        for (let i = 0; i < numBars; i++) {
          // Calculate x position - center each bar in its spacing slot
          // All bars use the exact same fixedBarWidth value
          const x = i * barSpacing + (barSpacing - fixedBarWidth) / 2;
          const normalizedPos = i / numBars;
          
          // Get sentiment for this position - start neutral, only color when sentiment is detected
          let barSentiment = 0; // Default to neutral
          if (segmentsCount > 0) {
            // Only get sentiment if this position is within the actual speech range (up to pointer position)
            // Bars beyond the current speech position should remain neutral
            if (normalizedPos <= pointerPosition) {
              // Smooth interpolation between segments for better color transitions
              const exactIndex = normalizedPos * segmentsCount;
              const lowerIndex = Math.floor(exactIndex);
              const upperIndex = Math.ceil(exactIndex);
              const t = exactIndex - lowerIndex;
              
              const lowerSentiment = segments[p.constrain(lowerIndex, 0, segmentsCount - 1)]?.sentiment || 0;
              const upperSentiment = segments[p.constrain(upperIndex, 0, segmentsCount - 1)]?.sentiment || 0;
              
              // Interpolate between adjacent segments for smooth transitions
              barSentiment = p.lerp(lowerSentiment, upperSentiment, t);
            }
            // If position is beyond current speech (pointer), barSentiment stays 0 (neutral)
          }
          // If no segments, barSentiment stays 0 (neutral)
          
          // Calculate bar height with animation - ONLY height varies, width is always the same
          const baseHeight = 20 + Math.abs(barSentiment) * 80;
          const animation = p.sin(time * 2 + i * 0.1) * 15;
          const barHeight = Math.max(5, baseHeight + animation); // Minimum height to ensure visibility
          
          // Get color based on sentiment with smooth transitions
          const barColor = getSentimentColor(barSentiment);
          
          // Draw bar - EXACTLY same width for all bars (no variation)
          p.noStroke();
          p.fill(barColor.r, barColor.g, barColor.b, 240);
          
          // Draw bar from center, extending up and down
          // Width is ALWAYS exactly fixedBarWidth - never changes
          const topY = centerY - barHeight / 2;
          p.rect(Math.floor(x), topY, fixedBarWidth, barHeight);
          
          // Add subtle glow effect - exact same width as bar
          p.fill(barColor.r, barColor.g, barColor.b, 30);
          p.rect(Math.floor(x), topY - 5, fixedBarWidth, barHeight + 10);
        }
        
        // Draw pointer line (horizontal, moving left to right)
        // Always draw pointer, even when no segments (at start position)
        const pointerX = pointerPosition * p.width;
        const pointerColor = getSentimentColor(currentPointerSentiment);
        
        // Draw pointer line with glow
        p.stroke(pointerColor.r, pointerColor.g, pointerColor.b, 100);
        p.strokeWeight(5);
        p.line(pointerX, 0, pointerX, p.height);
        
        p.stroke(pointerColor.r, pointerColor.g, pointerColor.b, 200);
        p.strokeWeight(2);
        p.line(pointerX, 0, pointerX, p.height);
        
        // Draw pointer indicator at center
        p.fill(pointerColor.r, pointerColor.g, pointerColor.b, 255);
        p.noStroke();
        p.circle(pointerX, centerY, 14);
        
        // Draw pointer glow
        p.fill(pointerColor.r, pointerColor.g, pointerColor.b, 80);
        p.circle(pointerX, centerY, 28);
      };

      p.windowResized = () => {
        // Resize canvas to fit container
        const containerWidth = containerRef.current?.clientWidth || p.windowWidth;
        const containerHeight = containerRef.current?.clientHeight || 400;
        p.resizeCanvas(containerWidth, containerHeight);
      };
      
    };

    p5InstanceRef.current = new p5(sketch, containerRef.current);
    
    // Set up ResizeObserver after p5 instance is created
    if (containerRef.current && p5InstanceRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (p5InstanceRef.current && containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          const containerHeight = containerRef.current.clientHeight;
          // Access the p5 instance's resizeCanvas method
          const p5Instance = p5InstanceRef.current as any;
          if (p5Instance.resizeCanvas) {
            p5Instance.resizeCanvas(containerWidth, containerHeight);
          }
        }
      });
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      p5InstanceRef.current?.remove();
      p5InstanceRef.current = null;
    };
  }, []); // Only create sketch once, sentiment/keywords accessed via refs

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
};
