
"use client";

import { useState, useEffect } from "react";

type TimerScreenProps = {
  onStop: () => void;
};

export function TimerScreen({ onStop }: TimerScreenProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm cursor-pointer"
      onClick={onStop}
    >
      <div className="text-8xl font-bold font-mono text-primary tabular-nums">
        {formatTime(elapsedTime)}
      </div>
      <p className="mt-4 text-lg text-muted-foreground">Click anywhere to stop</p>
    </div>
  );
}
