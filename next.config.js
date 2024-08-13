/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["pdfmake"],
  images: {
    remotePatterns: [
      {
        protocol: "https", // Use 'https' for production
        hostname: "api.inovcc.com", // Specify the production API hostname
        pathname: "/**", // Allows all paths on this domain
      },
      {
        protocol: "https", // Use 'https' for production
        hostname: "worthy-cats-5f3ad8d62a.strapiapp.com", // Specify the production API hostname
        pathname: "/**", // Allows all paths on this domain
      },
      {
        protocol: "http", // Use 'http' for localhost
        hostname: "localhost", // Specify 'localhost' as the hostname
        port: "1337", // Specify the port, if necessary
        pathname: "/**", // Allows all paths on this domain
      },
    ],
  },
};

module.exports = nextConfig;
