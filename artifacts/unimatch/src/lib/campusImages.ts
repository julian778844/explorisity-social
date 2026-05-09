
export type CampusImage = {
  url: string;
  alt?: string;
  caption?: string;
  source?: string;
  tags?: string[];
};

const preferredCampusTerms = [
  "aerial",
  "drone",
  "campus overview",
  "campus view",
  "quad",
  "green",
  "library",
  "main campus",
  "campus skyline",
  "wide view",
  "landmark",
  "courtyard",
  "academic building",
  "university hall"
];

const weakCampusTerms = [
  "door",
  "dorm door",
  "residence hall door",
  "hallway",
  "bathroom",
  "bedroom",
  "single room",
  "entrance closeup",
  "parking lot",
  "sign only",
  "random building"
];

export function scoreCampusImage(image: CampusImage): number {
  const text = [
    image.url,
    image.alt,
    image.caption,
    image.source,
    ...(image.tags || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = 0;

  for (const term of preferredCampusTerms) {
    if (text.includes(term)) score += 3;
  }

  for (const term of weakCampusTerms) {
    if (text.includes(term)) score -= 5;
  }

  if (text.includes("residence hall") && !text.includes("aerial") && !text.includes("campus view")) {
    score -= 3;
  }

  return score;
}

export function getBestCampusImages(images: CampusImage[], limit = 4): CampusImage[] {
  return [...images]
    .map((image) => ({ image, score: scoreCampusImage(image) }))
    .filter(({ score }) => score >= -1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ image }) => image);
}

export const campusImageGuidelines = {
  preferred: preferredCampusTerms,
  avoid: weakCampusTerms,
};
