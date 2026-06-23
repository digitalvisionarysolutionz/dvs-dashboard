import StatusBadge from "./StatusBadge.jsx";

export default function PriorityBadge({ priority }) {
  const normalizedPriority = priority?.toLowerCase();

  const tone =
    normalizedPriority === "high"
      ? "danger"
      : normalizedPriority === "medium"
        ? "warning"
        : "success";

  return <StatusBadge tone={tone}>{priority}</StatusBadge>;
}