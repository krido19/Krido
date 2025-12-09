import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website' }) => {
    const siteTitle = 'Krido Bahtiar - Frontend Developer | Next.js & React';
    const defaultDescription = 'Frontend Developer spesialis Next.js, React, dan modern web development.';
    const siteUrl = window.location.origin;
    const defaultImage = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/default-og.jpg`; // Fallback if needed

    // If title is provided, append it. If not, use the main keywords title.
    // If the provided title is just the name "Krido Bahtiar", we avoid "Krido Bahtiar | Krido Bahtiar..."
    const metaTitle = (title && !siteTitle.includes(title))
        ? `${title} | ${siteTitle}`
        : siteTitle;
    const metaDescription = description || defaultDescription;
    const metaImage = image || defaultImage;
    const metaUrl = url || window.location.href;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="canonical" href={metaUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={metaUrl} />
            <meta property="twitter:title" content={metaTitle} />
            <meta property="twitter:description" content={metaDescription} />
            <meta property="twitter:image" content={metaImage} />
        </Helmet>
    );
};

export default SEO;
