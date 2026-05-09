import { linkifyText, lookupReference } from "@/lib/references";

type RefProps = {
  name: string;
  className?: string;
  children?: React.ReactNode;
};

export function Ref({ name, className = "", children }: RefProps) {
  const url = lookupReference(name);
  const label = children ?? name;
  if (!url) return <>{label}</>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-[hsl(var(--accent))] hover:underline underline-offset-2 decoration-[hsl(var(--accent)/0.6)] transition-colors ${className}`}
    >
      {label}
    </a>
  );
}

type RefListProps = {
  names: string[];
  separator?: string;
  className?: string;
  itemClassName?: string;
};

export function RefList({ names, separator = " · ", className = "", itemClassName = "" }: RefListProps) {
  return (
    <span className={className}>
      {names.map((n, i) => (
        <span key={`${n}-${i}`}>
          <Ref name={n} className={itemClassName} />
          {i < names.length - 1 && <span className="text-muted-foreground">{separator}</span>}
        </span>
      ))}
    </span>
  );
}

export function LinkifiedText({ text, className = "" }: { text: string; className?: string }) {
  const chunks = linkifyText(text);
  return (
    <span className={className}>
      {chunks.map((c, i) =>
        c.kind === "ref" ? (
          <a
            key={i}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[hsl(var(--accent))] hover:underline underline-offset-2 decoration-[hsl(var(--accent)/0.6)] transition-colors"
          >
            {c.value}
          </a>
        ) : (
          <span key={i}>{c.value}</span>
        ),
      )}
    </span>
  );
}
