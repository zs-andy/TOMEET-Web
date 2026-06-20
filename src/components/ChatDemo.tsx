"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

type Scene = {
  userMsg: string;
  agentThink: string;
  agentReply: string;
  matchName: string;
  matchDesc: string;
};

type Phase = "typing" | "thinking" | "replying" | "match" | "done";

export default function ChatDemo() {
  const chatT = useTranslations("chat");
  const rawScenes = chatT.raw("scenes") as Scene[];
  const topics = chatT.raw("topics") as string[];

  const [sceneIndex, setSceneIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [displayedUser, setDisplayedUser] = useState("");
  const [displayedAgent, setDisplayedAgent] = useState("");

  const scene = rawScenes[sceneIndex];

  const reset = useCallback(() => {
    setDisplayedUser("");
    setDisplayedAgent("");
    setPhase("typing");
  }, []);

  const goToScene = (i: number) => {
    if (i === sceneIndex) return;
    setSceneIndex(i);
    reset();
  };

  useEffect(() => {
    if (phase !== "typing") return;
    if (displayedUser.length < scene.userMsg.length) {
      const timer = setTimeout(() => {
        setDisplayedUser(scene.userMsg.slice(0, displayedUser.length + 1));
      }, 40);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setPhase("thinking"), 500);
      return () => clearTimeout(timer);
    }
  }, [phase, displayedUser, scene.userMsg]);

  useEffect(() => {
    if (phase !== "thinking") return;
    const timer = setTimeout(() => setPhase("replying"), 1500);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "replying") return;
    if (displayedAgent.length < scene.agentReply.length) {
      const timer = setTimeout(() => {
        setDisplayedAgent(scene.agentReply.slice(0, displayedAgent.length + 1));
      }, 30);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setPhase("match"), 300);
      return () => clearTimeout(timer);
    }
  }, [phase, displayedAgent, scene.agentReply]);

  useEffect(() => {
    if (phase !== "match") return;
    const timer = setTimeout(() => setPhase("done"), 2500);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    const timer = setTimeout(() => {
      setSceneIndex((i) => (i + 1) % rawScenes.length);
      reset();
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase, rawScenes.length, reset]);

  return (
    <div>
      {/* Topic tabs */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-5 flex-wrap">
        {topics.map((topic, i) => (
          <button
            key={i}
            onClick={() => goToScene(i)}
            className="relative cursor-pointer transition-all duration-300 ease-out"
          >
            <motion.span
              animate={{
                scale: i === sceneIndex ? 1.1 : 1,
                color: i === sceneIndex ? "#18181B" : "#A1A1AA",
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`text-sm whitespace-nowrap ${
                i === sceneIndex ? "font-bold" : "font-normal"
              }`}
            >
              {topic}
            </motion.span>
            {i === sceneIndex && (
              <motion.div
                layoutId="topicUnderline"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-[0_4px_32px_rgba(0,0,0,0.06)]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">Rendez Agent</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-1" />
        </div>

        {/* Messages */}
        <div className="px-6 py-8 min-h-[280px] flex flex-col justify-end gap-3">
          <AnimatePresence mode="popLayout">
            {displayedUser && (
              <motion.div
                key={`user-${sceneIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="self-end max-w-[80%]"
              >
                <div className="bg-orange-300/40 text-gray-900 px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed">
                  {displayedUser}
                  {phase === "typing" && (
                    <span className="inline-block w-[2px] h-3.5 bg-gray-900/50 ml-0.5 animate-pulse" />
                  )}
                </div>
              </motion.div>
            )}

            {phase === "thinking" && (
              <motion.div
                key={`think-${sceneIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="self-start"
              >
                <div className="bg-gray-50 text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm">
                  {scene.agentThink}
                  <span className="inline-flex ml-1.5 gap-[3px] align-middle">
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </motion.div>
            )}

            {(phase === "replying" || phase === "match" || phase === "done") && (
              <motion.div
                key={`reply-${sceneIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="self-start max-w-[80%]"
              >
                <div className="bg-gray-50 text-gray-900 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed">
                  {displayedAgent}
                  {phase === "replying" && (
                    <span className="inline-block w-[2px] h-3.5 bg-gray-400 ml-0.5 animate-pulse" />
                  )}
                </div>
              </motion.div>
            )}

            {(phase === "match" || phase === "done") && (
              <motion.div
                key={`match-${sceneIndex}`}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="self-start max-w-[80%]"
              >
                <div className="bg-gray-50 px-4 py-3 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {scene.matchName[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{scene.matchName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{scene.matchDesc}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
