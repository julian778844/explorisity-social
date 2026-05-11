type DateParts = {
  month: string;
  day: string;
  year: string;
  hour: string;
  minute: string;
  dayPeriod: string;
  timeZoneName: string;
};

function getLocalTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

function getParts(value: string | Date): DateParts {
  const date = value instanceof Date ? value : new Date(value);
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: getLocalTimeZone(),
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return {
    month: part("month"),
    day: part("day"),
    year: part("year"),
    hour: part("hour"),
    minute: part("minute"),
    dayPeriod: part("dayPeriod"),
    timeZoneName: part("timeZoneName"),
  };
}

export function formatPostTime(value: string | Date, prefix: "Posted" | "Edited" = "Posted") {
  const parts = getParts(value);
  const time = `${parts.hour}:${parts.minute} ${parts.dayPeriod}`.trim();
  const zone = parts.timeZoneName || "UTC";

  if (prefix === "Edited") {
    return `${prefix} ${time} ${zone}`;
  }

  return `${prefix} ${parts.month} ${parts.day}, ${parts.year} at ${time} ${zone}`;
}

export function wasPostEdited(createdAt: string, updatedAt?: string | null) {
  if (!updatedAt) return false;

  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();

  return Number.isFinite(created) && Number.isFinite(updated) && updated - created > 1000;
}
