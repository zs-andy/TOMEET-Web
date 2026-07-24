"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import Logo from "./Logo";
import type { AuthViewer } from "@/lib/auth";

type ChatMessage = {
  id: number;
  role: "agent" | "user";
  text: string;
  imageUrl?: string;
};

type PhotoAttachment = {
  name: string;
  url: string;
};

function localizedHref(locale: string, path: string) {
  return locale === "zh" ? `/zh${path}` : path;
}

function getInitial(label: string) {
  return label.trim().charAt(0).toUpperCase() || "Y";
}

export default function AgentChat({ viewer }: { viewer: AuthViewer }) {
  const t = useTranslations("agent");
  const locale = useLocale();
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<PhotoAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef(new Set<string>());
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "agent", text: t("welcome") },
  ]);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const profileHref = localizedHref(locale, "/profile");
  const hasStarted = messages.some((message) => message.role === "user");
  const avatarStyle = useMemo(
    () =>
      viewer.avatarUrl
        ? { backgroundImage: `url(${JSON.stringify(viewer.avatarUrl)})` }
        : undefined,
    [viewer.avatarUrl]
  );

  function sendMessage() {
    const text = draft.trim();
    if (!text && !attachment) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "user",
        text,
        imageUrl: attachment?.url,
      },
    ]);
    setDraft("");
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    objectUrlsRef.current.add(url);
    setAttachment({ name: file.name, url });
  }

  function removeAttachment() {
    if (attachment) {
      URL.revokeObjectURL(attachment.url);
      objectUrlsRef.current.delete(attachment.url);
    }
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="agent-shell">
      <header className="agent-header">
        <Link
          href={localizedHref(locale, "/")}
          className="agent-brand"
          aria-label="TOMEET home"
        >
          <Logo size={29} />
        </Link>

        <Link
          href={profileHref}
          className="user-avatar"
          aria-label={t("openProfile")}
          title={viewer.label}
        >
          <span
            className={`user-avatar-image${viewer.avatarUrl ? " has-image" : ""}`}
            style={avatarStyle}
            aria-hidden="true"
          >
            {!viewer.avatarUrl && getInitial(viewer.label)}
          </span>
        </Link>
      </header>

      <section className="agent-conversation" aria-live="polite">
        <div className="agent-message-list">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`chat-message chat-message--${message.role}${
                message.id === 1 && hasStarted ? " chat-message--compact" : ""
              }${message.imageUrl ? " has-image" : ""}`}
            >
              {message.role === "agent" && (
                <span className="agent-message-mark" aria-hidden="true" />
              )}
              {message.imageUrl && (
                <span
                  className="chat-message-image"
                  style={{
                    backgroundImage: `url(${JSON.stringify(message.imageUrl)})`,
                  }}
                  role="img"
                  aria-label={t("photoMessage")}
                />
              )}
              {message.text && <p>{message.text}</p>}
            </article>
          ))}
        </div>
      </section>

      <div className="agent-composer-wrap">
        <form className="agent-composer" onSubmit={handleSubmit}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhotoChange}
          />
          {attachment ? (
            <span className="agent-attachment">
              <span
                className="agent-attachment-image"
                style={{
                  backgroundImage: `url(${JSON.stringify(attachment.url)})`,
                }}
                role="img"
                aria-label={attachment.name}
              />
              <button
                type="button"
                className="agent-attachment-remove"
                onClick={removeAttachment}
                aria-label={t("removePhoto")}
              >
                ×
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="agent-photo"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t("addPhoto")}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3.5 5.5A1.5 1.5 0 0 1 5 4h10a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 15 16H5a1.5 1.5 0 0 1-1.5-1.5v-9Z" />
                <path d="m4 13 3.2-3.2 2.4 2.4 1.7-1.7L16 15M13.4 8a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z" />
              </svg>
            </button>
          )}
          <label className="sr-only" htmlFor="agent-message">
            {t("inputLabel")}
          </label>
          <textarea
            id="agent-message"
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            className="agent-input"
          />
          <button
            type="submit"
            className="agent-send"
            disabled={!draft.trim() && !attachment}
            aria-label={t("send")}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 15V5m0 0L6.5 8.5M10 5l3.5 3.5" />
            </svg>
          </button>
        </form>
      </div>
    </main>
  );
}
