# School Comparison Updates

Added richer school comparison details.

## Compare Page Updates

- Winner school logo now appears directly under the verdict area.
- Each compared school card now shows the official school website domain when available.
- Each compared school card now shows notable alumni.
- The comparison detail cards now include Notable Alumni and Official Website sections.

## Data Source Notes

- Alumni are pulled from the existing `famousAlumni` field in `src/data/universities.ts`.
- Official websites are pulled from the centralized school domain registry in `src/lib/schoolPhotos.ts`.
- Logos use the existing `SchoolLogo` component, which already falls back from curated logos to domain logos to a monogram.
