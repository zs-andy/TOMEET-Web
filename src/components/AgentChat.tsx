"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import Logo from "./Logo";
import type { AuthViewer } from "@/lib/auth";
import {
  getAgentMessages,
  registerImageInput,
  sendAgentMessage,
  signImageUpload,
  TomeetApiError,
  TomeetJobError,
  TomeetJobTimeoutError,
  uploadSignedImage,
  waitForJob,
} from "@/lib/tomeet-api";
import type { AgentMessage, LlmJob } from "@/lib/tomeet-api";

type ChatMessage = {
  id: string;
  role: "agent" | "user";
  text: string;
  imageUrl?: string;
  pending?: boolean;
};

type ImageMimeType = "image/jpeg" | "image/png" | "image/webp";

type PhotoAttachment = {
  file: File;
  mimeType: ImageMimeType;
  name: string;
  url: string;
};

type Activity = "loading" | "uploading" | "thinking" | null;

const IMAGE_MARKER = "[发送了一张图片]";
const AUDIO_MARKER = "[发送了一段录音]";
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set<ImageMimeType>([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function localizedHref(locale: string, path: string) {
  return locale === "zh" ? `/zh${path}` : path;
}

function getInitial(label: string) {
  return label.trim().charAt(0).toUpperCase() || "Y";
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export default function AgentChat({ viewer }: { viewer: AuthViewer }) {
  const t = useTranslations("agent");
  const locale = useLocale();
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<PhotoAttachment | null>(null);
  const [activity, setActivity] = useState<Activity>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "agent", text: t("welcome") },
  ]);
  const conversationRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef(new Set<string>());
  const imageUrlsByMessageIdRef = useRef(new Map<string, string>());
  const serverMessageIdsRef = useRef(new Set<string>());
  const retryTextRef = useRef<{ content: string; idempotencyKey: string } | null>(
    null
  );
  const mountedRef = useRef(true);

  const profileHref = localizedHref(locale, "/profile");
  const hasStarted = messages.some((message) => message.role === "user");
  const isInteractionDisabled = activity !== null;
  const avatarStyle = useMemo(
    () =>
      viewer.avatarUrl
        ? { backgroundImage: `url(${JSON.stringify(viewer.avatarUrl)})` }
        : undefined,
    [viewer.avatarUrl]
  );

  const toChatMessage = useCallback(
    (message: AgentMessage): ChatMessage => {
      let text = message.content;
      if (message.role === "user" && text.startsWith(IMAGE_MARKER)) {
        const hint = text.slice(IMAGE_MARKER.length).trim();
        text = hint ? t("photoSentWithHint", { hint }) : t("photoSent");
      } else if (message.role === "user" && text.startsWith(AUDIO_MARKER)) {
        const hint = text.slice(AUDIO_MARKER.length).trim();
        text = hint ? t("audioSentWithHint", { hint }) : t("audioSent");
      }

      return {
        id: message.id,
        role: message.role === "assistant" ? "agent" : "user",
        text,
        imageUrl: imageUrlsByMessageIdRef.current.get(message.id),
      };
    },
    [t]
  );

  const applyServerMessages = useCallback(
    (history: AgentMessage[]) => {
      serverMessageIdsRef.current = new Set(
        history.map((message) => message.id)
      );
      if (!mountedRef.current) return;

      setMessages(
        history.length > 0
          ? history.map(toChatMessage)
          : [{ id: "welcome", role: "agent", text: t("welcome") }]
      );
    },
    [t, toChatMessage]
  );

  const reconcileMessages = useCallback(
    async (
      signal?: AbortSignal,
      imagePreview?: {
        beforeIds: Set<string>;
        url: string;
      }
    ) => {
      const { messages: history } = await getAgentMessages(viewer.id, signal);

      if (imagePreview) {
        const imageMessage = [...history]
          .reverse()
          .find(
            (message) =>
              message.role === "user" &&
              !imagePreview.beforeIds.has(message.id) &&
              message.content.startsWith(IMAGE_MARKER)
          );
        if (imageMessage) {
          imageUrlsByMessageIdRef.current.set(imageMessage.id, imagePreview.url);
        }
      }

      applyServerMessages(history);
      return history;
    },
    [applyServerMessages, viewer.id]
  );

  const getDisplayError = useCallback(
    (error: unknown) => {
      if (error instanceof TomeetJobTimeoutError) return t("jobTimeout");
      if (error instanceof TomeetJobError) return error.message;
      if (error instanceof TomeetApiError) {
        if (error.body.error === "API_NOT_CONFIGURED") {
          return t("configurationError");
        }
        if (error.body.error === "UNAUTHENTICATED") {
          return t("sessionExpired");
        }
        return error.message;
      }
      return t("requestFailed");
    },
    [t]
  );

  useEffect(() => {
    mountedRef.current = true;
    const objectUrls = objectUrlsRef.current;

    return () => {
      mountedRef.current = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    void reconcileMessages(controller.signal)
      .catch((error: unknown) => {
        if (active && !isAbortError(error) && mountedRef.current) {
          setErrorMessage(getDisplayError(error));
        }
      })
      .finally(() => {
        if (active && mountedRef.current) setActivity(null);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [getDisplayError, reconcileMessages]);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (!conversation) return;

    conversation.scrollTo({
      top: conversation.scrollHeight,
      behavior: hasStarted ? "smooth" : "auto",
    });
  }, [activity, hasStarted, messages]);

  async function finishJob(job: LlmJob) {
    if (job.status !== "completed") await waitForJob(job);
  }

  async function sendMessage() {
    const text = draft.trim();
    const currentAttachment = attachment;
    if ((!text && !currentAttachment) || isInteractionDisabled) return;

    if (currentAttachment && text.length > 2_000) {
      setErrorMessage(t("photoHintTooLong"));
      return;
    }

    const beforeIds = new Set(serverMessageIdsRef.current);
    const optimisticId = `local-${crypto.randomUUID()}`;
    const textIdempotencyKey = currentAttachment
      ? null
      : retryTextRef.current?.content === text
        ? retryTextRef.current.idempotencyKey
        : crypto.randomUUID();
    let acceptedByBackend = false;

    setErrorMessage(null);
    setMessages((current) => [
      ...current,
      {
        id: optimisticId,
        role: "user",
        text,
        imageUrl: currentAttachment?.url,
        pending: true,
      },
    ]);
    setDraft("");
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      if (currentAttachment) {
        setActivity("uploading");
        const signedUpload = await signImageUpload({
          userId: viewer.id,
          fileName: currentAttachment.name,
          mimeType: currentAttachment.mimeType,
          sizeBytes: currentAttachment.file.size,
        });
        await uploadSignedImage(signedUpload, currentAttachment.file);

        setActivity("thinking");
        const { job } = await registerImageInput({
          userId: viewer.id,
          storagePath: signedUpload.path,
          mimeType: currentAttachment.mimeType,
          sizeBytes: currentAttachment.file.size,
          hint: text || undefined,
        });
        acceptedByBackend = true;
        await reconcileMessages(undefined, {
          beforeIds,
          url: currentAttachment.url,
        });
        await finishJob(job);
      } else {
        setActivity("thinking");
        const { userMessage, job } = await sendAgentMessage({
          userId: viewer.id,
          displayName: viewer.label.trim().slice(0, 80) || t("you"),
          content: text,
          idempotencyKey: textIdempotencyKey!,
        });
        acceptedByBackend = true;
        serverMessageIdsRef.current.add(userMessage.id);
        setMessages((current) =>
          current.map((message) =>
            message.id === optimisticId ? toChatMessage(userMessage) : message
          )
        );
        await finishJob(job);
      }

      await reconcileMessages();
    } catch (error: unknown) {
      let history: AgentMessage[] = [];
      try {
        history = await reconcileMessages(
          undefined,
          currentAttachment
            ? { beforeIds, url: currentAttachment.url }
            : undefined
        );
      } catch {
        // Preserve the original failure when reconciliation is also unavailable.
      }

      acceptedByBackend ||= history.some(
        (message) => message.role === "user" && !beforeIds.has(message.id)
      );

      if (!acceptedByBackend && mountedRef.current) {
        setMessages((current) =>
          current.filter((message) => message.id !== optimisticId)
        );
        setDraft(text);
        if (currentAttachment) setAttachment(currentAttachment);
      }
      if (!currentAttachment) {
        retryTextRef.current = acceptedByBackend
          ? null
          : { content: text, idempotencyKey: textIdempotencyKey! };
      }
      if (mountedRef.current) setErrorMessage(getDisplayError(error));
    } finally {
      if (acceptedByBackend && !currentAttachment) retryTextRef.current = null;
      if (mountedRef.current) setActivity(null);
    }
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!SUPPORTED_IMAGE_TYPES.has(file.type as ImageMimeType)) {
      event.target.value = "";
      setErrorMessage(t("unsupportedPhoto"));
      return;
    }
    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      event.target.value = "";
      setErrorMessage(t("photoTooLarge"));
      return;
    }

    if (attachment) {
      URL.revokeObjectURL(attachment.url);
      objectUrlsRef.current.delete(attachment.url);
    }
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.add(url);
    setAttachment({
      file,
      mimeType: file.type as ImageMimeType,
      name: file.name,
      url,
    });
    setErrorMessage(null);
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
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  async function handleRefresh() {
    if (isInteractionDisabled) return;
    setErrorMessage(null);
    setActivity("loading");
    try {
      await reconcileMessages();
    } catch (error: unknown) {
      if (mountedRef.current) setErrorMessage(getDisplayError(error));
    } finally {
      if (mountedRef.current) setActivity(null);
    }
  }

  const activityLabel =
    activity === "loading"
      ? t("loadingHistory")
      : activity === "uploading"
        ? t("uploadingPhoto")
        : activity === "thinking"
          ? t("thinking")
          : null;

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

      <section
        ref={conversationRef}
        className="agent-conversation"
        aria-live="polite"
        aria-busy={activity !== null}
      >
        <div className="agent-message-list">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`chat-message chat-message--${message.role}${
                message.role === "agent" && hasStarted
                  ? " chat-message--compact"
                  : ""
              }${message.imageUrl ? " has-image" : ""}${
                message.pending ? " chat-message--pending" : ""
              }`}
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

          {activityLabel && (
            <article className="chat-message chat-message--agent agent-status">
              <span className="agent-message-mark" aria-hidden="true" />
              <p>{activityLabel}</p>
            </article>
          )}
        </div>
      </section>

      <div className="agent-composer-wrap">
        {errorMessage && (
          <div className="agent-error" role="alert">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => void handleRefresh()}>
              {t("refresh")}
            </button>
          </div>
        )}
        <form className="agent-composer" onSubmit={handleSubmit}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            disabled={isInteractionDisabled}
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
                disabled={isInteractionDisabled}
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
              disabled={isInteractionDisabled}
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
            maxLength={attachment ? 2_000 : 20_000}
            disabled={isInteractionDisabled}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            className="agent-input"
          />
          <button
            type="submit"
            className="agent-send"
            disabled={
              isInteractionDisabled || (!draft.trim() && !attachment)
            }
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
