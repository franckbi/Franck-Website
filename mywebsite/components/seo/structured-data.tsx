import { headers } from 'next/headers';

interface StructuredDataProps {
  data: object | object[];
}

export function StructuredData({ data }: StructuredDataProps) {
  const jsonLd = Array.isArray(data)
    ? data.map(item => JSON.stringify(item, null, 0)).join('\n')
    : JSON.stringify(data, null, 0);

  // Read per-request nonce injected by middleware (header: x-nonce)
  const nonce = headers().get('x-nonce') ?? undefined;

  return (
    <script
      type="application/ld+json"
      // Attach per-request nonce so the script is allowed by CSP
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
