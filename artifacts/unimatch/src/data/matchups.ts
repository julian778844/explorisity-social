export interface Matchup {
  id: string;
  schoolA: string; // university ID
  schoolB: string; // university ID
  votesA: number;
  votesB: number;
  title: string;
  debateContext: string;
  tags: string[];
}

export const trendingMatchups: Matchup[] = [
  {
    id: "m1",
    schoolA: "mit",
    schoolB: "stanford",
    votesA: 45200,
    votesB: 48100,
    title: "The Ultimate Tech Showdown",
    debateContext: "East Coast rigor vs. West Coast startup culture. Does MIT's deep technical focus beat Stanford's proximity to Sand Hill Road?",
    tags: ["Engineering", "Computer Science", "Founders"]
  },
  {
    id: "m2",
    schoolA: "harvard",
    schoolB: "yale",
    votesA: 32400,
    votesB: 28900,
    title: "The Classic Ivy Rivalry",
    debateContext: "Harvard's unmatched global brand vs. Yale's collaborative residential colleges and arts focus.",
    tags: ["Prestige", "Law", "Humanities"]
  },
  {
    id: "m3",
    schoolA: "uc-berkeley",
    schoolB: "stanford",
    votesA: 51200,
    votesB: 49800,
    title: "Bay Area Battle",
    debateContext: "The public powerhouse vs. the private elite. Berkeley's grit and research volume vs. Stanford's polish and resources.",
    tags: ["Silicon Valley", "CS", "ROI"]
  },
  {
    id: "m4",
    schoolA: "oxford",
    schoolB: "harvard",
    votesA: 18500,
    votesB: 22100,
    title: "Old World vs New World",
    debateContext: "1000 years of history and the tutorial system vs. the American Ivy League powerhouse with unlimited endowment.",
    tags: ["Global Elite", "Rhodes", "History"]
  }
];
