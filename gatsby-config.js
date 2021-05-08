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
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    'gatsby-plugin-sharp',
    'gatsby-plugin-eslint',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-no-sourcemaps',
    'gatsby-plugin-image',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: smd.title,
        short_name: 'wapy',
        start_url: '/',
        background_color: '#f2f2f2',
        theme_color: '#FF5722',
        display: 'minimal-ui',
        icon: 'src/images/wapy.png',
      },
    },
    'gatsby-plugin-robots-txt',
    {
      resolve: 'gatsby-plugin-canonical-urls',
      options: {
        siteUrl: smd.siteUrl,
      },
    },
    'gatsby-plugin-sitemap',
    {
      resolve: 'gatsby-plugin-postcss',
      options: {
        postCssPlugins: [
          require( 'tailwindcss' ),
          require( 'autoprefixer' ),
          require( 'cssnano' ),
        ],
      },
    },
    'gatsby-transformer-sharp',
  ],
};
