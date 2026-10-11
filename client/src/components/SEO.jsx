import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url }) => {
  const siteName = "Arshiya's Kitchen";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const desc = description || 'Discover, share, and plan delicious recipes. Your all-in-one kitchen companion.';
  let absoluteImage = image;
  if (image && typeof window !== 'undefined') {
    try {
      absoluteImage = new URL(image, window.location.origin).href;
    } catch {
      absoluteImage = image;
    }
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      {absoluteImage && <meta property="og:image" content={absoluteImage} />}
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {absoluteImage && <meta name="twitter:image" content={absoluteImage} />}
    </Helmet>
  );
};

export default SEO;
