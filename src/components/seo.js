/* eslint-disable */
import { useStaticQuery, graphql } from "gatsby";
import React from "react";
import { Helmet } from "react-helmet";

const SEO = ( { description, lang, meta, keywords, title } ) => {
  const { site } = useStaticQuery( graphql`
    query DefaultSEOQuery {
      site {
        siteMetadata {
          title
          description
          author
        }
      }
    }
  ` );

  const metaDescription = description || site.siteMetadata.description;
  const metaTitle = title || site.siteMetadata.title;

  keywords.push( site.siteMetadata.title );

  return (
    <Helmet
      htmlAttributes = { {
        lang,
      } }
      meta = { [
        {
          name: 'description',
          content: metaDescription,
        },
        {
          property: 'og:title',
          content: metaTitle,
        },
        {
          property: 'og:description',
          content: metaDescription,
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:site_name',
          content: site.siteMetadata.title,
        },
        {
          name: 'twitter:card',
          content: 'summary',
        },
        {
          name: 'twitter:title',
          content: metaTitle,
        },
        {
          name: 'twitter:description',
          content: metaDescription,
        },
      ]
        .concat(
          keywords.length > 0
            ? {
              name: 'keywords',
              content: keywords.join( ', ' ),
            }
            : [],
        )
        .concat( meta ) }
      title = { title }
      titleTemplate = { `%s` }
      defaultTitle = { `${ site.siteMetadata.title }` }
    />
  );
};

SEO.defaultProps = {
  lang: 'en-US',
  keywords: [
    'wapy',
    'meceware',
    'freelance',
    'freelancer',
    'coder for hire',
  ],
  meta: [],
};

export default SEO;
