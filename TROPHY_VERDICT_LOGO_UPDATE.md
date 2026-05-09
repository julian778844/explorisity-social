
# Trophy Verdict Logo Update

Added:

artifacts/unimatch/src/components/VerdictTrophy.tsx

Use this component anywhere the comparison verdict is rendered.

Example:

import VerdictTrophy from "@/components/VerdictTrophy";

<VerdictTrophy
  winnerName={winner.name}
  winnerLogoUrl={winner.logoUrl}
  verdict="Best overall fit based on rankings, outcomes, and student activity"
/>

The trophy will show the winning school logo centered on the trophy.
If no logo is available, it falls back to the first letter of the winning school name.
