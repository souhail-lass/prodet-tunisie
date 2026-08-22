/**
 * Renders a schema.org JSON-LD payload as a <script> tag.
 *
 * The `<` escaping prevents a `</script>` sequence inside the data from
 * breaking out of the script element (the standard JSON-LD injection guard).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
