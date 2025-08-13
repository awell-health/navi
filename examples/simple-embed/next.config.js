/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@awell-health/navi-js", "@awell-health/navi-js-react"],
  allowedDevOrigins: ["localhost", "192.168.*.*", "*"],
};

module.exports = nextConfig;
