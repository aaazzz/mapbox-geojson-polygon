/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.geojson$/,
      use: ['json-loader']
    })
    // Important: return the modified config
    return config
  }
}
