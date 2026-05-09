
import { getBestCampusImages, type CampusImage } from "@/lib/campusImages";

type CampusOverviewGalleryProps = {
  schoolName: string;
  images?: CampusImage[];
};

export default function CampusOverviewGallery({
  schoolName,
  images = [],
}: CampusOverviewGalleryProps) {
  const bestImages = getBestCampusImages(images, 4);

  if (!bestImages.length) {
    return (
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Campus overview
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {schoolName}
            </h2>
          </div>
          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
            🏫 Wide campus visuals preferred
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-8 text-center">
          <div className="text-5xl">🎓</div>
          <p className="mt-3 text-sm font-semibold text-slate-600">
            Add drone shots, campus overviews, quads, libraries, landmarks, or skyline-style images here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Campus overview
        </p>
        <h2 className="text-2xl font-black text-slate-950">{schoolName}</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {bestImages.map((image, index) => (
          <figure
            key={`${image.url}-${index}`}
            className="overflow-hidden rounded-2xl border bg-slate-50"
          >
            <img
              src={image.url}
              alt={image.alt || `${schoolName} campus overview`}
              className="h-56 w-full object-cover"
              loading="lazy"
            />
            {(image.caption || image.alt) && (
              <figcaption className="p-3 text-sm font-medium text-slate-600">
                {image.caption || image.alt}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
