import { useState, useEffect, useCallback } from "react";



const generateRandomColor = () => ({
  r: Math.floor(Math.random() * 256),
  g: Math.floor(Math.random() * 256),
  b: Math.floor(Math.random() * 256),
});

const generateRandomGradient = () => ({
  start: generateRandomColor(),
  end: generateRandomColor(),
});

const interpolateColor = (start, end, progress) => ({
  r: Math.round(start.r + (end.r - start.r) * progress),
  g: Math.round(start.g + (end.g - start.g) * progress),
  b: Math.round(start.b + (end.b - start.b) * progress),
});

const interpolateGradient = (
  start,
  end,
  progress
) => ({
  start: interpolateColor(start.start, end.start, progress),
  end: interpolateColor(start.end, end.end, progress),
});

const getRandomColor = () => ({
  r: Math.floor(Math.random() * 256),
  g: Math.floor(Math.random() * 256),
  b: Math.floor(Math.random() * 256),
});

export function useColorTransition(transitionDuration = 3000) {
  const [gradient, setGradient] = useState({
    start: getRandomColor(),
    end: getRandomColor(),
  });
  const [targetGradient, setTargetGradient] = useState(
    generateRandomGradient()
  );
  const [startGradient, setStartGradient] = useState(gradient);
  const [startTime, setStartTime] = useState(performance.now());
  const [isPaused, setIsPaused] = useState(false);

  const generateNewTarget = useCallback(() => {
    setStartGradient(gradient);
    setTargetGradient(generateRandomGradient());
    setStartTime(performance.now());
  }, [gradient]);

  const togglePause = () => setIsPaused((prev) => !prev);

  useEffect(() => {
    if (isPaused) return;

    const animationFrame = requestAnimationFrame(function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / transitionDuration, 1);

      setGradient(interpolateGradient(startGradient, targetGradient, progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        generateNewTarget();
      }
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [
    startGradient,
    targetGradient,
    startTime,
    transitionDuration,
    isPaused,
    generateNewTarget,
  ]);

  return { gradient, isPaused, togglePause };
}
