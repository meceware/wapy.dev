import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

export const siteConfig = serverRuntimeConfig;