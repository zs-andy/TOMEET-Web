function isEnabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export const FOODIES_ENABLED = isEnabled(
  process.env.NEXT_PUBLIC_FOODIES_ENABLED
);

export const QR_SERVICE_ENABLED = isEnabled(
  process.env.NEXT_PUBLIC_QR_SERVICE_ENABLED
);
