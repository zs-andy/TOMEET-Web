"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState } from "react";

const placeholderColors = [
  "#ff6137",
  "#b26dc2",
  "#0097e6",
  "#3e6b15",
  "#f5c4cc",
  "#dcd8cf",
];

export default function ChatDemo() {
  const chatT = useTranslations("chat");
  const topics = chatT.raw("topics") as string[];
  const [sceneIndex, setSceneIndex] = useState(0);
  const placeholderColor = placeholderColors[sceneIndex % placeholderColors.length];

  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
        {topics.map((topic, i) => (
          <button
            key={topic}
            onClick={() => setSceneIndex(i)}
            className="relative cursor-pointer rounded-full px-3 py-1"
          >
            {i === sceneIndex && (
              <motion.div
                layoutId="topicPill"
                className="absolute inset-0 rounded-full bg-highlight-green"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            <span
              className={`relative z-10 text-[14px] whitespace-nowrap transition-colors duration-300 font-bold ${
                i === sceneIndex ? "text-bone-white" : "text-graphite-warm"
              }`}
            >
              {topic}
            </span>
          </button>
        ))}
      </div>

      <motion.div
        key={sceneIndex}
        initial={{ opacity: 0.88 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="h-[300px] w-full"
        style={{ backgroundColor: placeholderColor }}
        aria-label={`${topics[sceneIndex]} placeholder`}
      />
    </div>
  );
}
