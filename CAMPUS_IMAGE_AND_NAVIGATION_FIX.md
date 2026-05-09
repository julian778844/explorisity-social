
# Campus Image + Navigation Fix

## Back button / refresh 404 fix

Added:
- vercel.json at repo root
- artifacts/unimatch/vercel.json

This prevents Vercel 404 errors when users go back, refresh, or open nested React routes directly.

## Campus image quality improvement

Added:
- artifacts/unimatch/src/lib/campusImages.ts
- artifacts/unimatch/src/components/CampusOverviewGallery.tsx
- lib/data/campus-image-guidelines.json

Prioritize:
- drone shots
- aerial campus overviews
- wide quad photos
- iconic campus landmarks
- main libraries
- campus skyline/wide views

Avoid:
- random doors
- residence hall closeups
- hallways
- bedroom/interior dorm shots
- parking lots
- sign-only photos

## Suggested use

import CampusOverviewGallery from "@/components/CampusOverviewGallery";

<CampusOverviewGallery
  schoolName={school.name}
  images={school.campusImages}
/>
