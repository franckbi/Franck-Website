interface StructuredDataProps {
  data: object | object[];
}

export function StructuredData({ data }: StructuredDataProps) {
  const jsonLd = Array.isArray(data)
    ? data.map(item => JSON.stringify(item, null, 0)).join('\n')
    : JSON.stringify(data, null, 0);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
