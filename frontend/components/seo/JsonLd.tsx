import {
  getFaqJsonLd,
  getOrganizationJsonLd,
  getSoftwareApplicationJsonLd,
  getWebSiteJsonLd,
} from '@/lib/seo';

export function JsonLd() {
  const schemas = [
    getOrganizationJsonLd(),
    getWebSiteJsonLd(),
    getSoftwareApplicationJsonLd(),
    getFaqJsonLd(),
  ];

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema['@type'] as string}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
