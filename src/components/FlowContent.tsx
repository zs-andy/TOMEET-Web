"use client";

import { useTranslations } from "next-intl";
import ImagePlaceholder from "./ImagePlaceholder";

type ChatScene = {
  agentReply: string;
  matchName: string;
  matchDesc: string;
};

const STORIES = [
  {
    number: "01",
    step: "step1",
    feature: "feature1Desc",
    heading: "story1Heading",
    visual: "story1Visual",
  },
  {
    number: "02",
    step: "step2",
    feature: "feature2Desc",
    heading: "story2Heading",
    visual: "story2Visual",
  },
  {
    number: "03",
    step: "step3",
    feature: "feature3Desc",
    heading: "story3Heading",
    visual: "story3Visual",
  },
] as const;

export default function FlowContent() {
  const landing = useTranslations("landing");
  const how = useTranslations("howItWorks");
  const features = useTranslations("features");
  const chat = useTranslations("chat");
  const trust = useTranslations("trust");

  const profileFacts = landing.raw("profileFacts") as string[];
  const meetFacts = landing.raw("meetFacts") as string[];
  const interests = trust.raw("items") as string[];
  const firstMatch = (chat.raw("scenes") as ChatScene[])[0];

  return (
    <section id="how" className="story-stack">
      <header className="story-header page-grid">
        <span className="eyebrow">{landing("storyKicker")}</span>
        <h2 className="editorial-title">{how("title")}</h2>
      </header>

      {STORIES.map((story, index) => (
        <article
          className={`story-section page-grid${index === 1 ? " story-section--reverse" : ""}`}
          key={story.number}
        >
          <div className="story-copy">
            <span className="story-index">
              {story.number} · {how(`${story.step}Title`)}
            </span>
            <h3 className="editorial-title">{landing(story.heading)}</h3>
            <p>{how(`${story.step}Desc`)}</p>
            <p className="story-detail">{features(story.feature)}</p>
          </div>

          <div className="story-visual">
            <ImagePlaceholder
              index={`0${index + 6}`}
              ratio="landscape"
              label={landing(story.visual)}
            />

            {index === 0 && (
              <div className="product-card">
                <p className="product-card-label">TOMEET profile</p>
                <h4>{landing("profileCardTitle")}</h4>
                <ul className="fact-list">
                  {profileFacts.map((fact) => (
                    <li key={fact}>
                      <span className="fact-dot" aria-hidden="true" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {index === 1 && (
              <div className="product-card">
                <p className="product-card-label">Vibe matching</p>
                <h4>{landing("matchCardTitle")}</h4>
                <p>{firstMatch.agentReply}</p>
                <div className="match-person">
                  <span className="mini-placeholder" aria-hidden="true" />
                  <div>
                    <strong>{firstMatch.matchName}</strong>
                    <span>{firstMatch.matchDesc}</span>
                  </div>
                </div>
              </div>
            )}

            {index === 2 && (
              <div className="product-card">
                <p className="product-card-label">Meet in real life</p>
                <h4>{landing("meetCardTitle")}</h4>
                <ul className="fact-list">
                  {meetFacts.map((fact) => (
                    <li key={fact}>
                      <span className="fact-dot" aria-hidden="true" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
                <div className="activity-row">
                  {interests.slice(0, 3).map((interest) => (
                    <span className="activity-pill" key={interest}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
