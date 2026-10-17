import { type MediaSource } from '@/lib/hero-media';

/**
 * Photos behind the Home amenities' 2×2 feature tile, by amenity id. Decorative: the tile's own
 * name and line say what it is, so the photo takes `alt=""`. An amenity without one keeps the
 * lake band. Stock stand-ins from `scripts/fetch-photos.mjs`.
 * TODO(client): real photos and usage rights (docs/09-roadmap.md #3); swap the files here.
 */
export const AMENITY_FEATURE_MEDIA: Readonly<Record<string, MediaSource>> = {
  wifi: { src: '/placeholder/amenity-wifi.jpg', width: 1600, height: 1067 },
};
