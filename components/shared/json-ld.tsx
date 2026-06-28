import type { Json } from "@/types/database";

type JsonLdProps = {
  data: Json | null;
};

function serializeJsonLd(data: Json): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: Readonly<JsonLdProps>) {
  if (!data) {
    return null;
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}
