"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

type VisualKind = "dialogue" | "match" | "meet";

const STEPS: Array<{
  num: string;
  titleKey: string;
  descKey: string;
  featureKey: string;
  dotColor: string;
  visual: VisualKind;
}> = [
  { num: "01", titleKey: "step1Title", descKey: "step1Desc", featureKey: "feature1Desc", dotColor: "bg-edit-orange", visual: "dialogue" },
  { num: "02", titleKey: "step2Title", descKey: "step2Desc", featureKey: "feature2Desc", dotColor: "bg-marker-yellow", visual: "match" },
  { num: "03", titleKey: "step3Title", descKey: "step3Desc", featureKey: "feature3Desc", dotColor: "bg-comment-blue", visual: "meet" },
];

function conceptText(text: string) {
  return text
    .replace(/The Agent/g, "AI")
    .replace(/Agent/g, "AI")
    .replace(/<[^>]+>/g, "");
}

function StepVisual({ kind }: { kind: VisualKind }) {
  if (kind === "dialogue") {
    const bars = [
      { left: "12%", top: "20%", width: "28%", color: "#ff6137" },
      { left: "12%", top: "36%", width: "20%", color: "#0097e6" },
      { left: "12%", top: "52%", width: "34%", color: "#ffdd33" },
      { left: "58%", top: "30%", width: "30%", color: "#000000" },
      { left: "66%", top: "46%", width: "22%", color: "#ff6137" },
      { left: "54%", top: "62%", width: "34%", color: "#0097e6" },
    ];

    return (
      <div aria-hidden data-step-visual="dialogue" className="relative aspect-[16/9] w-full overflow-hidden bg-[#f2eee8]">
        {bars.map((bar, i) => (
          <span
            key={`${bar.left}-${bar.top}-${i}`}
            className="absolute h-[24px] sm:h-[34px] lg:h-[42px]"
            style={{
              left: bar.left,
              top: bar.top,
              width: bar.width,
              backgroundColor: bar.color,
            }}
          />
        ))}
      </div>
    );
  }

  if (kind === "match") {
    return (
      <div aria-hidden data-step-visual="match" className="relative aspect-[16/9] w-full overflow-hidden bg-[#f2eee8]">
        <span className="absolute left-[25%] top-[24%] h-[52%] aspect-square rounded-full bg-edit-orange" />
        <span className="absolute right-[25%] top-[24%] h-[52%] aspect-square rounded-full bg-comment-blue opacity-90" />
      </div>
    );
  }

  return (
    <div aria-hidden data-step-visual="meet" className="relative aspect-[16/9] w-full overflow-hidden bg-[#f2eee8]">
      <div className="absolute left-[14%] top-[18%] h-[64%] w-[72%] bg-parchment">
        <span className="absolute left-[19%] top-1/2 -translate-y-1/2 text-[54px] font-black leading-none text-edit-orange sm:text-[78px] lg:text-[96px]">
          T
        </span>
        <span className="absolute right-[19%] top-1/2 -translate-y-1/2 text-[54px] font-black leading-none text-india-ink sm:text-[78px] lg:text-[96px]">
          T
        </span>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M 32 54 C 43 30, 56 72, 68 50"
            stroke="#0097e6"
            strokeLinecap="round"
            strokeWidth="5"
          />
        </svg>
      </div>
    </div>
  );
}

export default function FlowContent() {
  const tHow = useTranslations("howItWorks");
  const tFeatures = useTranslations("features");
  const [active, setActive] = useState(0);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  const scrollToStep = (index: number) => {
    setActive(index);
    stepRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div id="how" className="bg-parchment">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-24 lg:py-[120px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-[32px] sm:text-[48px] font-bold text-india-ink text-center tracking-[0] max-w-3xl mx-auto leading-tight"
        >
          {tHow("title")}
        </motion.h2>

        <div className="mt-20 flex gap-0">
          <div className="hidden md:block w-[220px] flex-shrink-0">
            <div className="sticky top-40">
              <div>
                <ul className="space-y-3">
                  {STEPS.map((s, i) => (
                    <li key={s.num}>
                      <button
                        type="button"
                        aria-current={i === active ? "step" : undefined}
                        className={`block w-full cursor-pointer border-l-4 px-4 py-3 text-left transition-colors ${
                          i === active
                            ? "border-india-ink bg-bone-white"
                            : "border-linen hover:bg-bone-white/60"
                        }`}
                        onClick={() => scrollToStep(i)}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`h-2.5 w-2.5 rounded-full ${s.dotColor}`} />
                          <span className="text-[12px] font-semibold text-graphite-warm">{s.num}</span>
                        </span>
                        <span className={`mt-1 block text-[18px] ${
                          i === active ? "font-bold text-india-ink" : "font-semibold text-graphite-warm"
                        }`}>
                          {tHow(s.titleKey)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-16 lg:space-y-20">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                ref={(node) => {
                  stepRefs.current[i] = node;
                }}
                id={`flow-step-${s.num}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                onViewportEnter={() => setActive(i)}
                viewport={{ once: false, margin: "-35% 0px -35% 0px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex min-h-[calc(100svh-96px)] scroll-mt-[92px] flex-col justify-center lg:min-h-[calc(100svh-112px)] lg:scroll-mt-[106px]"
              >
                <div className="md:hidden flex items-center gap-3 mb-5">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.dotColor}`} />
                  <span className="text-[22px] font-bold text-india-ink">
                    {tHow(s.titleKey)}
                  </span>
                </div>

                <StepVisual kind={s.visual} />

                <p className="mt-6 text-[20px] text-india-ink max-w-3xl leading-snug tracking-[0]">
                  <strong className="font-bold">{conceptText(tHow.raw(s.descKey))}</strong>
                </p>
                <p className="mt-2 text-[16px] text-graphite-warm max-w-2xl font-medium">
                  {conceptText(tFeatures(s.featureKey))}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
