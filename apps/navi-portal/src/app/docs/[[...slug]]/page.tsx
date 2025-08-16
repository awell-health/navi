import { redirect } from "next/navigation";

export default function DocsRedirectPage({
  params,
  searchParams,
}: {
  params: { slug?: string[] };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const base = "https://navi.mintlify.app";
  const path =
    Array.isArray(params.slug) && params.slug.length > 0
      ? `/${params.slug.join("/")}`
      : "";

  const query = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, v));
      } else if (typeof value === "string") {
        query.set(key, value);
      }
    }
  }

  const url = `${base}${path}${query.toString() ? `?${query.toString()}` : ""}`;
  redirect(url);
}
