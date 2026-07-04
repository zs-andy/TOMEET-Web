export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <span
      aria-label="TOMEET"
      className="inline-flex items-baseline font-black uppercase leading-none tracking-[0]"
      style={{ fontSize: `${Math.round(size * 0.82)}px` }}
    >
      <span className="text-edit-orange">T</span>
      <span className="text-india-ink">OMEE</span>
      <span className="text-edit-orange">T</span>
    </span>
  );
}
