import type { Metadata } from "next";

export default function Head({ params }: { params: { id: string } }) {
  const title = `Car Listing ${params.id} | DAOG Tech Hub`;
  const description = "View verified car listings and contact sellers directly through DAOG Tech Hub.";
  const canonical = `https://daogtechhub.com/cars/${params.id}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="product" />
      <meta property="twitter:card" content="summary_large_image" />
    </>
  );
}
