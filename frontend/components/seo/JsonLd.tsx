import {
  getFaqJsonLd,
  getOrganizationJsonLd,
  getSoftwareApplicationJsonLd,
  getWebPageJsonLd,
  getWebSiteJsonLd,
} from '@/lib/seo';

type JsonLdSchema = Record<string, unknown>;

interface JsonLdProps {
  /** Additional schemas (e.g. BreadcrumbList) for sub-pages. */
  extra?: JsonLdSchema[];
}

export function JsonLd({ extra = [] }: JsonLdProps) {
  const schemas: JsonLdSchema[] = [
    getOrganizationJsonLd(),
    getWebSiteJsonLd(),
    getWebPageJsonLd(),
    getSoftwareApplicationJsonLd(),
    getFaqJsonLd(),
    ...extra,
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`${String(schema['@type'])}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
