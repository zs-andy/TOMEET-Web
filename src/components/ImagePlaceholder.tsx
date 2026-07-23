type ImagePlaceholderProps = {
  label: string;
  index: string;
  ratio?: "portrait" | "landscape" | "square";
  className?: string;
};

export default function ImagePlaceholder({
  label,
  ratio = "landscape",
  className = "",
}: ImagePlaceholderProps) {
  return (
    <div
      className={`image-placeholder image-placeholder--${ratio} ${className}`}
      role="img"
      aria-label={label}
    />
  );
}
