/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http", // Use 'http' for localhost
        hostname: "localhost", // Specify 'localhost' as the hostname
        port: "1337", // Specify the port, if necessary (omit if not needed)
        // Optionally, you can specify a pathname here
      },
      // You can keep the existing domains or add other domains as needed
      {
        protocol: "https",
        hostname: "**.example.com",
        // Optionally, you can specify a port and pathname here
      },
    ],
  },
};

module.exports = nextConfig;
