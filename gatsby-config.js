/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */

const smd = process.env['WAPY'] === 'app' ? {
  title: `wapy.app`,
  description: `Kick off your next, great project with us.`,
  author: `@meceware`,
  siteUrl: 'https://www.wapy.app',
} : {
  title: `wapy.dev`,
  description: `Kick off your next, great project with us.`,
  author: `@meceware`,
  siteUrl: 'https://www.wapy.dev',
};

module.exports = {
  siteMetadata: smd,
  plugins: [
    'gatsby-plugin-postcss',
    `gatsby-plugin-image`,
    'gatsby-plugin-no-sourcemaps',
    'gatsby-plugin-robots-txt',
    {
      resolve: 'gatsby-plugin-canonical-urls',
      options: {
        siteUrl: smd.siteUrl,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: smd.title,
        short_name: `wapy`,
        start_url: `/`,
        background_color: '#f2f2f2',
        theme_color: '#FF5722',
        display: `minimal-ui`,
        icon: `src/images/wapy.png`,
      },
    },
    'gatsby-plugin-sitemap',
  ],
}
