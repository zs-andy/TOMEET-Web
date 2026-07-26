"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, LoaderCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createWechatConnectSession,
  getWechatConnectSession,
  streamWechatConnectSession,
  verifyWechatConnectSession,
  WechatConnectError,
  type CreatedWechatConnectSession,
  type WechatConnectSession,
  type WechatConnectStatus,
} from "@/lib/wechat-connect";

const EARLY_REFRESH_MS = 30_000;
const STREAM_RECONNECT_MS = 1_500;
const NOTICE_DISPLAY_MS = 8_000;

type LiveWechatSession = CreatedWechatConnectSession;
type SessionNotice = {
  kind: "success" | "error";
  message: string;
};

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function isTerminalStatus(status: WechatConnectStatus) {
  return status === "active" || status === "expired" || status === "failed";
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function waitFor(delay: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, delay);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

function sameSessionState(
  current: LiveWechatSession,
  next: WechatConnectSession
) {
  return (
    current.status === next.status &&
    current.expiresAt === next.expiresAt &&
    current.confirmedAt === next.confirmedAt &&
    current.errorCode === next.errorCode &&
    current.errorMessage === next.errorMessage
  );
}

export default function WechatQrEntry({
  initialSession,
  rapidRotationAvailable,
}: {
  initialSession: CreatedWechatConnectSession | null;
  rapidRotationAvailable: boolean;
}) {
  const t = useTranslations("access");
  const [rapidRotationEnabled, setRapidRotationEnabled] = useState(false);
  const rapidRotation = rapidRotationAvailable && rapidRotationEnabled;
  const [sessions, setSessions] = useState<LiveWechatSession[]>(
    initialSession ? [initialSession] : []
  );
  const [displaySessionId, setDisplaySessionId] = useState(
    initialSession?.sessionId ?? null
  );
  const [standbySessionId, setStandbySessionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(!initialSession);
  const [isReplacingDisplay, setIsReplacingDisplay] = useState(!initialSession);
  const [verifyingSessionId, setVerifyingSessionId] = useState<string | null>(null);
  const [verificationCodes, setVerificationCodes] = useState<Record<string, string>>({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [nextCreateRetryAt, setNextCreateRetryAt] = useState<number | null>(null);
  const [sessionGeneration, setSessionGeneration] = useState<number | null>(
    initialSession ? null : 0
  );
  const [notice, setNotice] = useState<SessionNotice | null>(null);
  const sessionControllersRef = useRef(new Map<string, AbortController>());
  const standbySessionRef = useRef<LiveWechatSession | null>(null);
  const isCreatingRef = useRef(!initialSession);
  const rapidRotationRef = useRef(rapidRotation);
  const replacementRequestedRef = useRef(new Set<string>());
  const claimedSessionIdsRef = useRef(new Set<string>());
  const handledTerminalIdsRef = useRef(new Set<string>());
  const displaySessionIdRef = useRef<string | null>(initialSession?.sessionId ?? null);
  const promoteNextCreatedRef = useRef(!initialSession);

  useEffect(() => {
    rapidRotationRef.current = rapidRotation;
  }, [rapidRotation]);

  const displaySession = useMemo(
    () => sessions.find((session) => session.sessionId === displaySessionId) ?? null,
    [displaySessionId, sessions]
  );
  const standbySession = useMemo(
    () => sessions.find((session) => session.sessionId === standbySessionId) ?? null,
    [sessions, standbySessionId]
  );
  const verificationSession = useMemo(
    () => sessions.find((session) => session.status === "verification_required") ?? null,
    [sessions]
  );

  const requestNewSession = useCallback(() => {
    setSessionGeneration((generation) => (generation ?? 0) + 1);
  }, []);

  const replaceDisplayedSession = useCallback((sessionId: string) => {
    if (replacementRequestedRef.current.has(sessionId)) return;
    replacementRequestedRef.current.add(sessionId);
    const standby = standbySessionRef.current;

    if (
      standby?.status === "pending" &&
      Date.parse(standby.expiresAt) > Date.now()
    ) {
      standbySessionRef.current = null;
      displaySessionIdRef.current = standby.sessionId;
      setDisplaySessionId(standby.sessionId);
      setStandbySessionId(null);
      setIsReplacingDisplay(false);
      setCreateError(null);
      return;
    }

    if (standby) {
      standbySessionRef.current = null;
      setSessions((current) =>
        current.filter((session) => session.sessionId !== standby.sessionId)
      );
      setStandbySessionId(null);
    }
    promoteNextCreatedRef.current = true;
    setIsReplacingDisplay(true);
    if (isCreatingRef.current) return;
    requestNewSession();
  }, [requestNewSession]);

  const updateSession = useCallback((next: WechatConnectSession) => {
    if (next.status === "scanned" || next.status === "verification_required") {
      claimedSessionIdsRef.current.add(next.sessionId);
    }
    if (
      isTerminalStatus(next.status) &&
      !handledTerminalIdsRef.current.has(next.sessionId)
    ) {
      handledTerminalIdsRef.current.add(next.sessionId);
      if (next.status === "active") {
        setNotice({ kind: "success", message: t("status.active.detail") });
      } else if (
        next.status === "failed" ||
        claimedSessionIdsRef.current.has(next.sessionId)
      ) {
        setNotice({ kind: "error", message: t("rescan") });
      }
    }

    setSessions((current) => {
      let changed = false;
      const updated = current.map((session) => {
        if (session.sessionId !== next.sessionId || sameSessionState(session, next)) {
          return session;
        }
        changed = true;
        return { ...session, ...next };
      });
      return changed ? updated : current;
    });
  }, [t]);

  useEffect(() => {
    if (sessionGeneration === null) return;
    const controller = new AbortController();
    let cancelled = false;

    const create = async () => {
      isCreatingRef.current = true;
      setIsCreating(true);
      setCreateError(null);
      setNextCreateRetryAt(null);

      try {
        const created = await createWechatConnectSession(
          controller.signal,
          rapidRotationRef.current
        );
        if (cancelled) return;
        setSessions((current) => [
          ...current.filter(
            (session) =>
              !isTerminalStatus(session.status) &&
              session.sessionId !== created.sessionId
          ),
          created,
        ]);
        if (promoteNextCreatedRef.current || displaySessionIdRef.current === null) {
          promoteNextCreatedRef.current = false;
          displaySessionIdRef.current = created.sessionId;
          setDisplaySessionId(created.sessionId);
          setIsReplacingDisplay(false);
        } else {
          standbySessionRef.current = created;
          setStandbySessionId(created.sessionId);
        }
      } catch (error) {
        if (cancelled || isAbortError(error)) return;
        const delay =
          error instanceof WechatConnectError && error.retryAfterMs
            ? error.retryAfterMs
            : 30_000;
        setCreateError(
          promoteNextCreatedRef.current
            ? errorMessage(error, t("unavailable"))
            : null
        );
        setNextCreateRetryAt(Date.now() + delay);
      } finally {
        if (!cancelled) {
          isCreatingRef.current = false;
          setIsCreating(false);
        }
      }
    };

    void create();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [sessionGeneration, t]);

  useEffect(() => {
    if (nextCreateRetryAt === null) return;
    const delay = Math.max(0, nextCreateRetryAt - Date.now());
    const timer = setTimeout(requestNewSession, delay);
    return () => clearTimeout(timer);
  }, [nextCreateRetryAt, requestNewSession]);

  useEffect(() => {
    const liveSessionIds = new Set<string>();

    for (const session of sessions) {
      if (
        isTerminalStatus(session.status) ||
        session.sessionId === standbySessionId
      ) {
        continue;
      }
      liveSessionIds.add(session.sessionId);
      if (sessionControllersRef.current.has(session.sessionId)) continue;

      const controller = new AbortController();
      sessionControllersRef.current.set(session.sessionId, controller);

      void (async () => {
        let latestStatus = session.status;
        while (!controller.signal.aborted && !isTerminalStatus(latestStatus)) {
          try {
            await streamWechatConnectSession(
              session.sessionId,
              session.sessionToken,
              {
                onSession: (next) => {
                  latestStatus = next.status;
                  setStreamError(null);
                  updateSession(next);
                },
              },
              controller.signal
            );
          } catch (error) {
            if (isAbortError(error) || controller.signal.aborted) break;

            try {
              const next = await getWechatConnectSession(
                session.sessionId,
                session.sessionToken,
                controller.signal
              );
              latestStatus = next.status;
              setStreamError(null);
              updateSession(next);
            } catch (fallbackError) {
              if (isAbortError(fallbackError) || controller.signal.aborted) break;
              setStreamError(t("pollError"));
            }
          }

          if (!isTerminalStatus(latestStatus)) {
            try {
              await waitFor(STREAM_RECONNECT_MS, controller.signal);
            } catch (error) {
              if (!isAbortError(error)) throw error;
            }
          }
        }

        if (sessionControllersRef.current.get(session.sessionId) === controller) {
          sessionControllersRef.current.delete(session.sessionId);
        }
      })();
    }

    for (const [sessionId, controller] of sessionControllersRef.current) {
      if (!liveSessionIds.has(sessionId)) {
        controller.abort();
        sessionControllersRef.current.delete(sessionId);
      }
    }
  }, [sessions, standbySessionId, t, updateSession]);

  useEffect(() => {
    const controllers = sessionControllersRef.current;
    return () => {
      for (const controller of controllers.values()) {
        controller.abort();
      }
      controllers.clear();
    };
  }, []);

  useEffect(() => {
    if (!displaySession) return;

    if (
      displaySession.status === "scanned" ||
      displaySession.status === "verification_required"
    ) {
      claimedSessionIdsRef.current.add(displaySession.sessionId);
    }

    if (displaySession.status === "pending") {
      const earlyExpiryDelay =
        Date.parse(displaySession.expiresAt) - Date.now() - EARLY_REFRESH_MS;
      if (earlyExpiryDelay > 0) {
        const timer = setTimeout(() => {
          replaceDisplayedSession(displaySession.sessionId);
        }, earlyExpiryDelay);
        return () => clearTimeout(timer);
      }
    }

    const timer = setTimeout(
      () => replaceDisplayedSession(displaySession.sessionId),
      0
    );
    return () => clearTimeout(timer);
  }, [displaySession, replaceDisplayedSession]);

  useEffect(() => {
    if (rapidRotation) return;
    const standby = standbySessionRef.current;
    if (!standby) return;
    standbySessionRef.current = null;
    setStandbySessionId(null);
    setSessions((current) =>
      current.filter((session) => session.sessionId !== standby.sessionId)
    );
  }, [rapidRotation]);

  useEffect(() => {
    if (
      !displaySession ||
      displaySession.status !== "pending" ||
      !rapidRotation ||
      standbySession ||
      isCreating ||
      isReplacingDisplay ||
      nextCreateRetryAt !== null
    ) {
      return;
    }
    const timer = setTimeout(requestNewSession, 0);
    return () => clearTimeout(timer);
  }, [
    displaySession,
    isCreating,
    isReplacingDisplay,
    nextCreateRetryAt,
    rapidRotation,
    requestNewSession,
    standbySession,
  ]);

  useEffect(() => {
    if (!standbySession) return;
    const delay = Math.max(
      0,
      Date.parse(standbySession.expiresAt) - Date.now() - EARLY_REFRESH_MS
    );
    const timer = setTimeout(() => {
      if (standbySessionRef.current?.sessionId === standbySession.sessionId) {
        standbySessionRef.current = null;
      }
      setStandbySessionId(null);
      setSessions((current) =>
        current.filter((session) => session.sessionId !== standbySession.sessionId)
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [standbySession]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verificationSession) return;
    const code = verificationCodes[verificationSession.sessionId] ?? "";
    if (!/^\d{4,12}$/.test(code)) return;

    setVerifyingSessionId(verificationSession.sessionId);
    setStreamError(null);
    try {
      const next = await verifyWechatConnectSession(
        verificationSession.sessionId,
        verificationSession.sessionToken,
        code
      );
      updateSession(next);
    } catch (error) {
      setStreamError(errorMessage(error, t("verifyError")));
    } finally {
      setVerifyingSessionId(null);
    }
  }

  const status = displaySession?.status;
  const verificationCode = verificationSession
    ? verificationCodes[verificationSession.sessionId] ?? ""
    : "";
  const visibleMessage = verificationSession
    ? t("status.verification_required.detail")
    : notice?.message ?? createError ?? (streamError ? t("pollError") : null);
  const visibleNoticeKind = verificationSession ? null : notice?.kind ?? null;
  const statusDetail = visibleMessage
    ? visibleMessage
    : status
      ? t(`status.${status}.detail`)
      : t("status.loading.detail");
  const shouldMaskDisplayedQr = Boolean(
    displaySession && displaySession.status !== "pending" && displaySession.status !== "active"
  );
  return (
    <div className="wechat-access-tile">
      <div className="wechat-access-frame">
        {displaySession?.qrCodeDataUrl ? (
          // The payload is a temporary credential, so the generated image stays in memory.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySession.qrCodeDataUrl}
            alt={t("qrAlt")}
            className="wechat-access-image"
          />
        ) : (
          <div className="wechat-access-loading" aria-label={t("status.loading.title")}>
            <LoaderCircle aria-hidden="true" />
          </div>
        )}

        {status === "active" ? (
          <div className="wechat-access-success" aria-hidden="true">
            <Check />
          </div>
        ) : null}

        {shouldMaskDisplayedQr ? (
          <div className="wechat-access-claimed" aria-label={t("refreshing")}>
            <RefreshCw aria-hidden="true" />
          </div>
        ) : null}

        {isCreating && isReplacingDisplay && displaySession?.qrCodeDataUrl ? (
          <span className="wechat-access-refreshing" aria-label={t("refreshing")}>
            <RefreshCw aria-hidden="true" />
          </span>
        ) : null}

        {createError && !isCreating ? (
          <button
            className={`wechat-access-retry${displaySession?.qrCodeDataUrl ? " wechat-access-retry--corner" : ""}`}
            type="button"
            onClick={requestNewSession}
            aria-label={t("retry")}
            title={t("retry")}
          >
            <RefreshCw aria-hidden="true" />
          </button>
        ) : null}

        {rapidRotationAvailable ? (
          <button
            className="wechat-access-rapid-toggle"
            type="button"
            role="switch"
            aria-checked={rapidRotation}
            aria-label={
              rapidRotation
                ? t("rapidRefreshOn")
                : t("rapidRefreshOff")
            }
            title={rapidRotation ? t("rapidRefreshOn") : undefined}
            onClick={() => setRapidRotationEnabled((enabled) => !enabled)}
          >
            <span aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {visibleMessage ? (
        <p
          className={`wechat-access-notice${visibleNoticeKind ? ` wechat-access-notice--${visibleNoticeKind}` : ""}`}
          role="status"
        >
          {visibleMessage}
        </p>
      ) : null}

      {verificationSession ? (
        <form className="wechat-access-verify" onSubmit={handleVerify}>
          <label htmlFor="wechat-verification-code" className="sr-only">
            {t("verificationLabel")}
          </label>
          <input
            id="wechat-verification-code"
            value={verificationCode}
            onChange={(event) => {
              const code = event.target.value.replace(/\D/g, "").slice(0, 12);
              setVerificationCodes((current) => ({
                ...current,
                [verificationSession.sessionId]: code,
              }));
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••"
            aria-invalid={verificationCode.length > 0 && verificationCode.length < 4}
          />
          <button
            type="submit"
            disabled={
              verifyingSessionId === verificationSession.sessionId ||
              !/^\d{4,12}$/.test(verificationCode)
            }
            aria-label={
              verifyingSessionId === verificationSession.sessionId
                ? t("verifying")
                : t("verify")
            }
          >
            {verifyingSessionId === verificationSession.sessionId ? (
              <LoaderCircle aria-hidden="true" />
            ) : (
              <Check aria-hidden="true" />
            )}
          </button>
        </form>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {statusDetail}
      </span>
    </div>
  );
}
