import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dentalg.dz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/patients",
          "/appointments",
          "/waiting-room",
          "/procedures",
          "/billing",
          "/prescriptions",
          "/lab",
          "/messages",
          "/users",
          "/settings",
          "/carrieres/manage",
          "/superadmin",
          "/api",
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
