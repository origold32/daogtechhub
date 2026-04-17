export default function Head({ params }: { params: { id: string } }) {
  const title = `Property ${params.id} | DAOG Tech Hub`;
  const description = "Browse verified real estate listings and secure your next property with DAOG Tech Hub.";
  const canonical = `https://daogtechhub.com/realestate/${params.id}`;

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
