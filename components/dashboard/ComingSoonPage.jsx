import AccentLine from "../ui/AccentLine.jsx";
import Panel from "../ui/Panel.jsx";

export default function ComingSoonPage({
  eyebrow,
  title,
  description,
  items = [],
}) {
  return (
    <section>
      <div className="mb-8">
        <div className="inline-flex flex-col items-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--app-accent)]">
            {eyebrow}
          </p>

          <AccentLine />
        </div>

        <h2 className="mt-5 text-3xl font-bold tracking-tight text-[var(--app-text)] md:text-5xl">
          {title}
        </h2>

        <p className="mt-4 max-w-2xl text-[var(--app-text-muted)]">
          {description}
        </p>
      </div>

      <Panel title={`${title} Roadmap`} eyebrow="Next Build">
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item}
              className="border border-[var(--app-border)] bg-black/20 p-4 text-sm font-semibold text-[var(--app-text-muted)]"
            >
              {item}
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}