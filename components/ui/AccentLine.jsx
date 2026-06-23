export default function AccentLine({ className = "" }) {
  return (
    <span
      className={`mt-2 block h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_16px_rgba(92,244,236,0.85)] ${className}`}
    />
  );
}