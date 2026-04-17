export default function Head({ params }: { params: { id: string } }) {
  const title = `Gadget ${params.id} | DAOG Tech Hub`;
  const description = "Explore gadget details, reviews and pricing on Nigeria's premium tech marketplace.";
  const canonical = `https://daogtechhub.com/gadgets/${params.id}`;

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
