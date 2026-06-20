"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
  speed?: number;
};

export function TypewriterText({ text, className, speed = 30 }: Props) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // If this message is older than 5s, show immediately
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <p className={cn(className)}>
      {displayed}
      {!done && <span className="animate-pulse">|</span>}
    </p>
  );
}
