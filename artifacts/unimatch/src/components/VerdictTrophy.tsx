
type VerdictTrophyProps = {
  winnerName: string;
  winnerLogoUrl?: string;
  verdict?: string;
};

export default function VerdictTrophy({
  winnerName,
  winnerLogoUrl,
  verdict = "Best Match",
}: VerdictTrophyProps) {
  return (
    <section className="mx-auto my-6 max-w-xl rounded-3xl border bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Verdict
      </p>

      <div className="relative mx-auto mt-4 flex h-32 w-32 items-center justify-center">
        <div className="absolute text-8xl leading-none">🏆</div>

        {winnerLogoUrl ? (
          <img
            src={winnerLogoUrl}
            alt={`${winnerName} logo`}
            className="relative z-10 mt-4 h-14 w-14 rounded-full border bg-white object-contain p-2 shadow-md"
          />
        ) : (
          <div className="relative z-10 mt-4 flex h-14 w-14 items-center justify-center rounded-full border bg-white text-lg font-bold shadow-md">
            {winnerName.slice(0, 1)}
          </div>
        )}
      </div>

      <h2 className="mt-4 text-2xl font-bold">{winnerName}</h2>
      <p className="mt-1 text-gray-600">{verdict}</p>
    </section>
  );
}
