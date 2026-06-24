import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, url, image }) => {
  const siteName = 'nineteen.dev';
  const fullTitle = title && title !== siteName ? `${title} | ${siteName}` : siteName;
  const defaultDesc = 'nineteen.dev — Professional Web & Mobile Development Studio';
  const defaultImage = '/logo.png';
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.origin : 'https://nineteen.dev');

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:image" content={image || defaultImage} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      <meta name="twitter:image" content={image || defaultImage} />
      <link rel="canonical" href={currentUrl} />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": siteName,
          "url": currentUrl,
          "description": defaultDesc,
          "publisher": {
            "@type": "Organization",
            "name": siteName,
            "logo": {
              "@type": "ImageObject",
              "url": `${currentUrl}/logo.png`
            }
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${currentUrl}/?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
