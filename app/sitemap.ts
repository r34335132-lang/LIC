import type { MetadataRoute } from 'next'
import { programas } from '@/lib/data'
import { SITE_URL } from '@/lib/marketing'

export default function sitemap(): MetadataRoute.Sitemap {
  const programUrls = programas
    .filter((programa) => programa.rvoe)
    .map((programa) => ({
      url: `${SITE_URL}/programas/${programa.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/inscripcion`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...programUrls,
  ]
}
