"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface RotatingTextProps {
  texts: string[];
  transition?: any;
  initial?: any;
  animate?: any;
  exit?: any;
  animatePresenceMode?: "sync" | "popLayout" | "wait";
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: "characters" | "words" | "lines" | string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

const RotatingText = forwardRef<any, RotatingTextProps>((props, ref) => {
  const {
    texts,
    transition = { type: "spring", damping: 25, stiffness: 300 },
    initial = { y: "100%", opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: "-120%", opacity: 0 },
    animatePresenceMode = "wait",
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = "first",
    loop = true,
    auto = true,
    splitBy = "characters",
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // Grapheme splitting logic (some environments need a fallback)
  const splitIntoCharacters = (text: string) => {
    if (typeof (Intl as any) !== "undefined" && (Intl as any).Segmenter) {
      const segmenter = new (Intl as any).Segmenter("en", {
        granularity: "grapheme",
      });
      return Array.from(
        segmenter.segment(text) as Iterable<{ segment: string }>,
        (seg) => seg.segment
      );
    }
    return Array.from(text);
  };

  // Build up array of word objects
  const elements = useMemo(() => {
    const currentText = texts[currentTextIndex] ?? "";
    if (splitBy === "characters") {
      const words = currentText.split(" ");
      return words.map((word, i) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== words.length - 1,
      }));
    } else if (splitBy === "words") {
      const wordArr = currentText.split(" ");
      return wordArr.map((w, i) => ({
        characters: [w],
        needsSpace: i !== wordArr.length - 1,
      }));
    } else if (splitBy === "lines") {
      const lines = currentText.split("\n");
      return lines.map((line, i) => ({
        characters: [line],
        needsSpace: i !== lines.length - 1,
      }));
    } else {
      const parts = currentText.split(splitBy);
      return parts.map((p, i) => ({
        characters: [p],
        needsSpace: i !== parts.length - 1,
      }));
    }
  }, [texts, currentTextIndex, splitBy]);

  // Decide how to stagger each character's entrance
  const getStaggerDelay = useCallback(
    (index: number, totalChars: number) => {
      switch (staggerFrom) {
        case "first":
          return index * staggerDuration;
        case "last":
          return (totalChars - 1 - index) * staggerDuration;
        case "center": {
          const center = Math.floor(totalChars / 2);
          return Math.abs(center - index) * staggerDuration;
        }
        case "random": {
          const randomIndex = Math.floor(Math.random() * totalChars);
          return Math.abs(randomIndex - index) * staggerDuration;
        }
        default:
          // If it's a number
          if (typeof staggerFrom === "number") {
            return Math.abs(staggerFrom - index) * staggerDuration;
          }
          return index * staggerDuration;
      }
    },
    [staggerFrom, staggerDuration]
  );

  // Switch to next text
  const handleIndexChange = useCallback(
    (newIndex: number) => {
      setCurrentTextIndex(newIndex);
      if (onNext) onNext(newIndex);
    },
    [onNext]
  );

  const next = useCallback(() => {
    if (texts.length === 0) return;
    const isLast = currentTextIndex === texts.length - 1;
    if (isLast && !loop) return;
    const nextIndex = isLast ? 0 : currentTextIndex + 1;
    handleIndexChange(nextIndex);
  }, [texts, currentTextIndex, loop, handleIndexChange]);

  const previous = useCallback(() => {
    if (texts.length === 0) return;
    const isFirst = currentTextIndex === 0;
    if (isFirst && !loop) return;
    const prevIndex = isFirst ? texts.length - 1 : currentTextIndex - 1;
    handleIndexChange(prevIndex);
  }, [texts, currentTextIndex, loop, handleIndexChange]);

  const jumpTo = useCallback(
    (index: number) => {
      if (texts.length === 0) return;
      const validIndex = Math.max(0, Math.min(index, texts.length - 1));
      handleIndexChange(validIndex);
    },
    [texts, handleIndexChange]
  );

  const reset = useCallback(() => {
    if (currentTextIndex !== 0) {
      handleIndexChange(0);
    }
  }, [currentTextIndex, handleIndexChange]);

  useImperativeHandle(ref, () => ({
    next,
    previous,
    jumpTo,
    reset,
  }));

  // Auto rotation
  useEffect(() => {
    if (!auto || texts.length < 2) return;
    const intervalId = setInterval(next, rotationInterval);
    return () => clearInterval(intervalId);
  }, [auto, texts.length, next, rotationInterval]);

  return (
    <motion.span
      className={cn("flex flex-wrap whitespace-pre-wrap relative", mainClassName)}
      {...rest}
      layout
      transition={transition}
    >
      <span className="sr-only">{texts[currentTextIndex]}</span>
      <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
        <motion.div
          key={currentTextIndex}
          className={cn(
            splitBy === "lines"
              ? "flex flex-col w-full"
              : "flex flex-wrap whitespace-pre-wrap relative"
          )}
          layout
          aria-hidden="true"
        >
          {elements.map((wordObj, wordIndex, array) => {
            // how many chars before this word
            const previousCharsCount = array
              .slice(0, wordIndex)
              .reduce((sum, w) => sum + w.characters.length, 0);
            return (
              <span
                key={wordIndex}
                className={cn("inline-flex", splitLevelClassName)}
              >
                {wordObj.characters.map((char, charIndex) => {
                  const absoluteIndex = previousCharsCount + charIndex;
                  const totalChars = array.reduce(
                    (sum, w) => sum + w.characters.length,
                    0
                  );
                  return (
                    <motion.span
                      key={charIndex}
                      initial={initial}
                      animate={animate}
                      exit={exit}
                      transition={{
                        ...transition,
                        delay: getStaggerDelay(absoluteIndex, totalChars),
                      }}
                      className={cn("inline-block", elementLevelClassName)}
                    >
                      {char}
                    </motion.span>
                  );
                })}
                {wordObj.needsSpace && <span className="whitespace-pre"> </span>}
              </span>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.span>
  );
});

RotatingText.displayName = "RotatingText";
export default RotatingText;
