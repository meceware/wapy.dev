module.exports = {
  siteMetadata: {
    title: `Wapy.dev`,
    description: `Kick off your next, great project with us.`,
    author: `@meceware`,
    siteUrl: 'https://www.wapy.dev',
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    'gatsby-plugin-eslint',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-no-sourcemaps',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'wapy.dev',
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
        siteUrl: 'https://www.wapy.dev/',
      },
    },
    {
      resolve: 'gatsby-plugin-advanced-sitemap',
      options: {
        exclude: [
          '/dev-404-page',
          '/404',
          '/404.html',
          '/offline-plugin-app-shell-fallback',
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-postcss',
      options: {
        postCssPlugins: [
          require( 'tailwindcss' )( './tailwind.config.js' ),
          require( 'autoprefixer' ),
          require( 'cssnano' ),
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-purgecss',
      options: {
        tailwind: true,
        purgeOnly: [ 'src/css/style.css' ],
      },
    },
  ],
}
