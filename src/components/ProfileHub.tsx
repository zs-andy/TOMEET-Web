"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  Check,
  ExternalLink,
  LoaderCircle,
  ScanLine,
  ShieldCheck,
  X
} from "lucide-react";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import Logo from "./Logo";

type ConnectStep = "scanner" | "found" | "waiting" | "success";
type RelationshipStatus =
  | "chain_pending"
  | "chain_confirmed"
  | "chain_failed"
  | "revoke_pending"
  | "revoked";

type RelationshipCredential = {
  id: string;
  friend_name: string;
  friend_avatar_url: string | null;
  relationship_label: string;
  confirmed_at: string;
  relationship_status: RelationshipStatus;
  chain_id: number | null;
  contract_address: string | null;
  chain_tx_hash: string | null;
  block_number: number | null;
  onchain_at: string | null;
};

type PendingRequest = {
  request_id: string;
  direction: "incoming" | "outgoing";
  other_user_id: string;
  other_name: string;
  other_avatar_url: string | null;
  relationship_label: string;
  request_status: string;
  expires_at: string;
  created_at: string;
};

type ResolvedTarget = {
  target_id: string;
  display_name: string;
  avatar_url: string | null;
  expires_at: string;
};

type BarcodeDetectorLike = {
  detect(source: ImageBitmapSource): Promise<Array<{ rawValue: string }>>;
};

type BarcodeDetectorConstructor = new (options: {
  formats: string[];
}) => BarcodeDetectorLike;

const relationshipPresetKeys = [
  "relationBuddy",
  "relationTeammate",
  "relationFriend",
  "relationCouple"
] as const;

type RelationshipPresetKey = (typeof relationshipPresetKeys)[number];

function localizedHref(locale: string, path: string) {
  return locale === "en" ? `/en${path}` : path;
}

function getInitial(label: string) {
  return label.trim().charAt(0).toUpperCase() || "T";
}

function explorerTransactionUrl(chainId: number | null, txHash: string | null) {
  if (!txHash) return null;
  const origin = chainId === 1776
    ? "https://blockscout.injective.network"
    : "https://testnet.blockscout.injective.network";
  return `${origin}/tx/${txHash}`;
}

export default function ProfileHub({
  viewer,
  initialInvite
}: {
  viewer: AuthViewer;
  initialInvite: string | null;
}) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const [isScannerOpen, setIsScannerOpen] = useState(Boolean(initialInvite));
  const [connectStep, setConnectStep] = useState<ConnectStep>(
    initialInvite ? "found" : "scanner"
  );
  const [friendName, setFriendName] = useState("");
  const [friendAvatarUrl, setFriendAvatarUrl] = useState<string | null>(null);
  const [scannedToken, setScannedToken] = useState(initialInvite);
  const [relationshipChoice, setRelationshipChoice] = useState<
    RelationshipPresetKey | "custom" | ""
  >("");
  const [customRelationship, setCustomRelationship] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<RelationshipCredential[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [showOnFoodies, setShowOnFoodies] = useState(true);
  const [credentialsLoading, setCredentialsLoading] = useState(true);
  const [credentialError, setCredentialError] = useState(false);
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const pendingRequestId = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const relationshipLabel = relationshipChoice === "custom"
    ? customRelationship.trim()
    : relationshipChoice
      ? t(relationshipChoice)
      : "";

  const createQrSession = useCallback(async () => {
    if (!isConfigured) {
      setCredentialError(true);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_relationship_qr_session", {
      p_display_name: viewer.label,
      p_avatar_url: viewer.avatarUrl
    });
    const result = Array.isArray(data) ? data[0] : data;
    if (error || !result?.token) {
      setCredentialError(true);
      return;
    }
    const profileUrl = new URL(localizedHref(locale, "/profile"), window.location.origin);
    profileUrl.searchParams.set("invite", result.token);
    const nextQrDataUrl = await QRCode.toDataURL(profileUrl.toString(), {
      width: 720,
      margin: 2,
      color: { dark: "#1c1b1b", light: "#ffffff" }
    });
    setQrDataUrl(nextQrDataUrl);
    setShowOnFoodies(result.show_on_foodies ?? true);
  }, [isConfigured, locale, viewer.avatarUrl, viewer.label]);

  const loadActivity = useCallback(async () => {
    if (!isConfigured) {
      setCredentialsLoading(false);
      setCredentialError(true);
      return;
    }
    const supabase = createClient();
    const [credentialResult, requestResult, visibilityResult] = await Promise.all([
      supabase.rpc("get_my_relationship_credentials"),
      supabase.rpc("get_my_pending_relationship_requests"),
      supabase.rpc("get_my_foodies_visibility")
    ]);
    if (credentialResult.error || requestResult.error || visibilityResult.error) {
      setCredentialError(true);
    } else {
      setCredentials((credentialResult.data ?? []) as RelationshipCredential[]);
      setPendingRequests((requestResult.data ?? []) as PendingRequest[]);
      setShowOnFoodies(visibilityResult.data ?? true);
      setCredentialError(false);
    }
    setCredentialsLoading(false);
  }, [isConfigured]);

  const checkPendingRequest = useCallback(async () => {
    if (!pendingRequestId.current || !isConfigured) return;
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_relationship_request_status", {
      p_request_id: pendingRequestId.current
    });
    const result = Array.isArray(data) ? data[0] : data;
    if (error || !result) return;
    if (result.request_status === "confirmed") {
      setConnectStep("success");
      pendingRequestId.current = null;
      void loadActivity();
    } else if (["rejected", "expired", "cancelled"].includes(result.request_status)) {
      setConnectStep("found");
      setCameraError(t("requestNotAccepted"));
      pendingRequestId.current = null;
    }
  }, [isConfigured, loadActivity, t]);

  useEffect(() => {
    const initial = window.setTimeout(() => void createQrSession(), 0);
    const refresh = window.setInterval(() => void createQrSession(), 60_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(refresh);
    };
  }, [createQrSession]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadActivity(), 0);
    if (!isConfigured) return () => window.clearTimeout(initialLoad);

    const supabase = createClient();
    const channel = supabase
      .channel(`relationship-live-${viewer.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "relationship_requests" },
        () => {
          void loadActivity();
          void checkPendingRequest();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "relationship_credentials" },
        () => void loadActivity()
      )
      .subscribe();

    return () => {
      window.clearTimeout(initialLoad);
      void supabase.removeChannel(channel);
    };
  }, [checkPendingRequest, isConfigured, loadActivity, viewer.id]);

  useEffect(() => {
    if (connectStep !== "waiting") return;
    const timer = window.setInterval(() => void checkPendingRequest(), 3000);
    return () => window.clearInterval(timer);
  }, [checkPendingRequest, connectStep]);

  const stopCamera = useCallback(() => {
    if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
    scanTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const resolveScannedToken = useCallback(async (token: string) => {
    if (!/^[0-9a-f]{64}$/u.test(token) || !isConfigured) return;
    setCameraError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("resolve_relationship_qr_session", {
      p_token: token
    });
    const target = (Array.isArray(data) ? data[0] : data) as ResolvedTarget | null;
    if (error || !target) {
      setCameraError(t("qrExpired"));
      return;
    }
    setScannedToken(token);
    setFriendName(target.display_name);
    setFriendAvatarUrl(target.avatar_url);
    setRelationshipChoice("");
    setCustomRelationship("");
    setConnectStep("found");
    stopCamera();
  }, [isConfigured, stopCamera, t]);

  const acceptScannedValue = useCallback((rawValue: string) => {
    try {
      const url = new URL(rawValue);
      const token = url.searchParams.get("invite");
      if (token) void resolveScannedToken(token);
    } catch {
      setCameraError(t("invalidQr"));
    }
  }, [resolveScannedToken, t]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const Detector = (window as typeof window & {
        BarcodeDetector?: BarcodeDetectorConstructor;
      }).BarcodeDetector;
      if (!Detector || !videoRef.current) {
        setCameraError(t("scannerUnsupported"));
        return;
      }

      const detector = new Detector({ formats: ["qr_code"] });
      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes[0]?.rawValue) acceptScannedValue(codes[0].rawValue);
        } catch {
          // Camera focus can make individual frames unreadable.
        }
      }, 550);
    } catch {
      setCameraError(t("cameraDenied"));
    }
  }, [acceptScannedValue, t]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => {
    if (!initialInvite) return;
    const timer = window.setTimeout(() => void resolveScannedToken(initialInvite), 0);
    return () => window.clearTimeout(timer);
  }, [initialInvite, resolveScannedToken]);

  const openScanner = () => {
    setScannedToken(null);
    setFriendName("");
    setFriendAvatarUrl(null);
    setRelationshipChoice("");
    setCustomRelationship("");
    setConnectStep("scanner");
    setIsScannerOpen(true);
    window.setTimeout(startCamera, 80);
  };

  const closeScanner = () => {
    stopCamera();
    setIsScannerOpen(false);
    setConnectStep("scanner");
    setRelationshipChoice("");
    setCustomRelationship("");
  };

  const confirmFriend = async () => {
    if (!scannedToken || !relationshipLabel || !isConfigured) {
      setCameraError(t("connectionUnavailable"));
      return;
    }
    setConnectStep("waiting");
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_relationship_request", {
      p_token: scannedToken,
      p_relationship_label: relationshipLabel
    });
    const result = Array.isArray(data) ? data[0] : data;
    if (error || !result?.request_id) {
      setConnectStep("found");
      setCameraError(error?.message || t("connectionUnavailable"));
      return;
    }
    pendingRequestId.current = result.request_id;
    void loadActivity();
  };

  const respondToRequest = async (requestId: string, accept: boolean) => {
    const supabase = createClient();
    const { error } = await supabase.rpc("respond_relationship_request", {
      p_request_id: requestId,
      p_accept: accept
    });
    if (error) setCredentialError(true);
    await loadActivity();
  };

  const toggleVisibility = async () => {
    if (visibilitySaving) return;
    setVisibilitySaving(true);
    const next = !showOnFoodies;
    const supabase = createClient();
    const { error } = await supabase.rpc("set_my_foodies_visibility", {
      p_visible: next
    });
    if (!error) setShowOnFoodies(next);
    else setCredentialError(true);
    setVisibilitySaving(false);
  };

  const revokeCredential = async (credentialId: string) => {
    if (!window.confirm(t("revokeConfirm"))) return;
    const supabase = createClient();
    const { error } = await supabase.rpc("revoke_relationship", {
      p_credential_id: credentialId
    });
    if (error) setCredentialError(true);
    await loadActivity();
  };

  const statusLabel = (status: RelationshipStatus) => {
    const key = {
      chain_pending: "chainPending",
      chain_confirmed: "chainConfirmed",
      chain_failed: "chainRetrying",
      revoke_pending: "revokePending",
      revoked: "revoked"
    }[status] as "chainPending" | "chainConfirmed" | "chainRetrying" | "revokePending" | "revoked";
    return t(key);
  };

  return (
    <main className="simple-profile-shell">
      <header className="simple-profile-header">
        <Link href={localizedHref(locale, "") || "/"} aria-label={t("backToHome")}>
          <Logo size={29} />
        </Link>
        <button type="button" className="simple-profile-scan" onClick={openScanner}>
          <ScanLine aria-hidden="true" />{t("scan")}
        </button>
      </header>

      <section className="simple-profile-qr" aria-label={t("title")}>
        <div className="simple-profile-person">
          <span aria-hidden="true">{getInitial(viewer.label)}</span>
          <div><strong>{viewer.label}</strong><small>{t("dynamicQr")}</small></div>
        </div>
        <div className="simple-profile-code">
          {qrDataUrl ? (
            <Image src={qrDataUrl} alt={t("personalQrAlt")} width={720} height={720} unoptimized priority />
          ) : (
            <span className="simple-profile-code-loading"><LoaderCircle aria-hidden="true" /></span>
          )}
        </div>
        <p>{credentialError ? t("connectionUnavailable") : t("scanHint")}</p>
        <span className="simple-profile-scroll-hint">{t("scrollCredentials")} ↓</span>
      </section>

      <section className="simple-credentials">
        <div className="simple-credentials-heading">
          <h1>{t("credentialsHeading")}</h1>
          <div className="simple-credentials-meta">
            {!credentialsLoading && !credentialError && <span>{credentials.length}</span>}
            <button type="button" onClick={toggleVisibility} disabled={visibilitySaving}>
              {showOnFoodies ? t("rankingVisibleShort") : t("rankingHiddenShort")}
            </button>
          </div>
        </div>
        <p className="simple-credentials-copy">{t("credentialCopy")}</p>

        {pendingRequests.some((request) => request.direction === "incoming") && (
          <div className="simple-request-list">
            {pendingRequests.filter((request) => request.direction === "incoming").map((request) => (
              <article className="simple-request-row" key={request.request_id}>
                <span className="simple-credential-avatar">{getInitial(request.other_name)}</span>
                <div><strong>{request.other_name}</strong><small>{request.relationship_label} · {t("friendRequest")}</small></div>
                <button type="button" onClick={() => void respondToRequest(request.request_id, false)}>{t("reject")}</button>
                <button type="button" className="is-primary" onClick={() => void respondToRequest(request.request_id, true)}>{t("accept")}</button>
              </article>
            ))}
          </div>
        )}

        <div className="simple-credential-list">
          {credentialsLoading && <div className="simple-credentials-state"><LoaderCircle />{t("loading")}</div>}
          {!credentialsLoading && credentialError && <div className="simple-credentials-state">{t("connectionUnavailable")}</div>}
          {!credentialsLoading && !credentialError && credentials.length === 0 && (
            <div className="simple-credentials-state">{t("noCredentials")}</div>
          )}
          {credentials.map((credential) => {
            const avatarStyle = credential.friend_avatar_url
              ? { backgroundImage: `url(${JSON.stringify(credential.friend_avatar_url)})` }
              : undefined;
            const explorerUrl = explorerTransactionUrl(credential.chain_id, credential.chain_tx_hash);
            return (
              <article key={credential.id} className="simple-credential-row">
                <span className={`simple-credential-avatar${credential.friend_avatar_url ? " has-image" : ""}`} style={avatarStyle} aria-hidden="true">
                  {!credential.friend_avatar_url && getInitial(credential.friend_name)}
                </span>
                <div className="simple-credential-person">
                  <strong>{credential.friend_name}</strong>
                  <small>{credential.relationship_label} · {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(credential.confirmed_at))}</small>
                </div>
                <code>{credential.chain_tx_hash ? `${credential.chain_tx_hash.slice(0, 8)}…` : credential.id.slice(0, 8)}</code>
                <div className="simple-credential-actions">
                  {explorerUrl ? (
                    <a href={explorerUrl} target="_blank" rel="noreferrer" className="simple-credential-status">
                      <Check aria-hidden="true" />{statusLabel(credential.relationship_status)}<ExternalLink aria-hidden="true" />
                    </a>
                  ) : (
                    <span className={`simple-credential-status is-${credential.relationship_status}`}>
                      {credential.relationship_status === "chain_pending" && <LoaderCircle aria-hidden="true" />}
                      {statusLabel(credential.relationship_status)}
                    </span>
                  )}
                  {credential.relationship_status === "chain_confirmed" && (
                    <button type="button" onClick={() => void revokeCredential(credential.id)}>{t("revoke")}</button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {isScannerOpen && (
        <div className="simple-scan-backdrop" role="presentation" onMouseDown={closeScanner}>
          <section className="simple-scan-modal" role="dialog" aria-modal="true" aria-labelledby="simple-scan-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="simple-scan-close" onClick={closeScanner} aria-label={t("close")}><X /></button>

            {connectStep === "scanner" && (
              <><h2 id="simple-scan-title">{t("scanTheirQr")}</h2><div className="simple-camera"><video ref={videoRef} muted playsInline /><span aria-hidden="true" /></div><p>{cameraError || t("scannerHelp")}</p></>
            )}

            {connectStep === "found" && (
              <div className="simple-connect-state">
                <span className={`simple-connect-avatar${friendAvatarUrl ? " has-image" : ""}`} style={friendAvatarUrl ? { backgroundImage: `url(${JSON.stringify(friendAvatarUrl)})` } : undefined}>{!friendAvatarUrl && getInitial(friendName)}</span>
                <h2 id="simple-scan-title">{friendName || t("nearbyFriend")}</h2>
                <p>{cameraError || t("confirmCopy", { name: friendName || t("nearbyFriend") })}</p>
                <div className="simple-relation-picker" role="group" aria-labelledby="simple-relation-label">
                  <span id="simple-relation-label" className="simple-relation-label">{t("chooseRelationship")}</span>
                  <div className="simple-relation-options">
                    {relationshipPresetKeys.map((key) => (
                      <button
                        type="button"
                        className={`simple-relation-chip${relationshipChoice === key ? " is-selected" : ""}`}
                        aria-pressed={relationshipChoice === key}
                        onClick={() => setRelationshipChoice(key)}
                        key={key}
                      >
                        {t(key)}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`simple-relation-chip${relationshipChoice === "custom" ? " is-selected" : ""}`}
                      aria-pressed={relationshipChoice === "custom"}
                      onClick={() => setRelationshipChoice("custom")}
                    >
                      {t("customRelationship")}
                    </button>
                  </div>
                  {relationshipChoice === "custom" && (
                    <input
                      className="simple-relation-custom"
                      value={customRelationship}
                      onChange={(event) => setCustomRelationship(event.target.value)}
                      maxLength={10}
                      autoFocus
                      aria-label={t("customRelationship")}
                      placeholder={t("customRelationshipPlaceholder")}
                    />
                  )}
                </div>
                <button type="button" className="simple-connect-primary" onClick={confirmFriend} disabled={!relationshipLabel}>{t("confirmAdd")}</button>
              </div>
            )}

            {connectStep === "waiting" && (
              <div className="simple-connect-state"><LoaderCircle className="simple-connect-loader" /><h2 id="simple-scan-title">{t("waitingFor", { name: friendName })}</h2><span className="simple-relation-preview">{relationshipLabel}</span><p>{t("waitingCopy")}</p></div>
            )}

            {connectStep === "success" && (
              <div className="simple-connect-state"><span className="simple-connect-success"><ShieldCheck /></span><h2 id="simple-scan-title">{t("nowFriends", { name: friendName })}</h2><span className="simple-relation-preview">{relationshipLabel}</span><p>{t("successCopy")}</p><button type="button" className="simple-connect-primary" onClick={closeScanner}>{t("done")}</button></div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
