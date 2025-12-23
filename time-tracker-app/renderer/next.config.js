/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    return config
  },
  serverRuntimeConfig: {
    APIURL:process.env.APIURL,
  },
  publicRuntimeConfig:{
    APIURL:process.env.APIURL,
  }
}
