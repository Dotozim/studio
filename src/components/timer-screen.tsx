
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";

type TimerScreenProps = {
  onStop: (startTime: Date, elapsedTime: number, edgeCount: number) => void;
};

export function TimerScreen({ onStop }: TimerScreenProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [edgeCount, setEdgeCount] = useState(0);
  const startTimeRef = useRef<Date>(new Date());

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
  
  const handleEdgeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setEdgeCount(c => c + 1);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm cursor-pointer p-4"
      onClick={() => onStop(startTimeRef.current, elapsedTime, edgeCount)}
    >
      <div className="flex flex-col items-center justify-center gap-4 md:gap-8">
        <div className="text-center">
            <p className="mb-2 md:mb-4 text-3xl md:text-4xl font-bold text-destructive">{edgeCount}</p>
            <Button
                className="w-36 h-36 md:w-48 md:h-48 rounded-full text-3xl md:text-4xl font-bold"
                variant="outline"
                onClick={handleEdgeClick}
                >
                EDGE
            </Button>
        </div>
        <div className="text-center">
            <div className="text-6xl md:text-8xl font-bold font-mono text-primary tabular-nums">
            {formatTime(elapsedTime)}
            </div>
            <p className="mt-2 md:mt-4 text-base md:text-lg text-muted-foreground">Click anywhere to stop</p>
        </div>
      </div>
    </div>
  );
}
