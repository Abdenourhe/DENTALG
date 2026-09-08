import type { MetadataRoute } from "next";
import { listPublicJobOffers } from "@/lib/actions/job-offers";
import {
  listPublicClinicListings,
  listPublicEquipmentListings,
} from "@/lib/actions/carrieres-listings";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dentalg.dz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [offers, clinicListings, equipmentListings] = await Promise.all([
    listPublicJobOffers(),
    listPublicClinicListings(),
    listPublicEquipmentListings(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: appUrl, changeFrequency: "weekly", priority: 1 },
    {
      url: `${appUrl}/fonctionnalites`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${appUrl}/carrieres`, changeFrequency: "daily", priority: 0.8 },
    {
      url: `${appUrl}/request-clinic`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: `${appUrl}/register`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${appUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${appUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const offerRoutes: MetadataRoute.Sitemap = offers.map((offer) => ({
    url: `${appUrl}/carrieres/${offer.id}`,
    lastModified: offer.publishedAt ?? undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const clinicListingRoutes: MetadataRoute.Sitemap = clinicListings.map(
    (item) => ({
      url: `${appUrl}/carrieres/clinics/${item.id}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.5,
    }),
  );

  const equipmentListingRoutes: MetadataRoute.Sitemap = equipmentListings.map(
    (item) => ({
      url: `${appUrl}/carrieres/equipment/${item.id}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.5,
    }),
  );

  return [
    ...staticRoutes,
    ...offerRoutes,
    ...clinicListingRoutes,
    ...equipmentListingRoutes,
  ];
}
