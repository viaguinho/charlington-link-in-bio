"use client";

import { motion, useAnimate } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function RandomLetterSwap({
  labels = [],
  intervalMs = 4000,
  reverse = true,
  transition = { duration: 0.8, type: "spring" },
  staggerDuration = 0.02,
  className,
  ...props
}) {
  const [scope, animate] = useAnimate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentLabel = labels[currentIndex] || "";
  const nextIndex = (currentIndex + 1) % labels.length;
  const nextLabel = labels[nextIndex] || "";

  // Pad the shorter string with spaces so the loop length matches
  const maxLength = Math.max(currentLabel.length, nextLabel.length);
  const currentPadded = currentLabel.padEnd(maxLength, " ");
  const nextPadded = nextLabel.padEnd(maxLength, " ");

  const playAnimation = useCallback(() => {
    if (isAnimating || labels.length <= 1) return;
    setIsAnimating(true);

    const shuffled = Array.from({ length: maxLength }, (_, i) => i).sort(
      () => Math.random() - 0.5
    );

    let completedCount = 0;

    for (let i = 0; i < maxLength; i++) {
      const idx = shuffled[i];
      const mergedTransition = {
        ...transition,
        delay: i * staggerDuration,
      };

      animate(
        `.letter-${idx}`,
        { y: reverse ? "100%" : "-100%" },
        mergedTransition
      ).then(() => {
        animate(`.letter-${idx}`, { y: 0 }, { duration: 0 });
      });

      animate(`.letter-secondary-${idx}`, { top: "0%" }, mergedTransition)
        .then(() => {
          animate(
            `.letter-secondary-${idx}`,
            { top: reverse ? "-100%" : "100%" },
            { duration: 0 }
          );
        })
        .then(() => {
          completedCount++;
          if (completedCount === maxLength) {
            // All letters animated, update state
            setCurrentIndex(nextIndex);
            setIsAnimating(false);
          }
        });
    }
  }, [
    isAnimating,
    labels.length,
    maxLength,
    transition,
    staggerDuration,
    reverse,
    animate,
    nextIndex,
  ]);

  useEffect(() => {
    if (labels.length <= 1) return;
    const intervalId = setInterval(playAnimation, intervalMs);
    return () => clearInterval(intervalId);
  }, [playAnimation, intervalMs, labels.length]);

  return (
    <motion.span
      className={cn(
        "relative flex flex-wrap items-center justify-center overflow-hidden",
        className
      )}
      onHoverStart={playAnimation}
      ref={scope}
      {...props}
    >
      <span className="sr-only">{currentLabel}</span>
      {currentPadded.split("").map((letter, i) => (
        <span
          aria-hidden="true"
          className="relative flex whitespace-pre"
          key={i}
        >
          <motion.span
            className={`relative letter-${i}`}
            style={{ top: 0 }}
          >
            {letter}
          </motion.span>
          <motion.span
            className={`absolute letter-secondary-${i}`}
            style={{ top: reverse ? "-100%" : "100%" }}
          >
            {nextPadded[i]}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export default RandomLetterSwap;
