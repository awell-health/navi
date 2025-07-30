/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@awell-health/navi-js", "@awell-health/navi-js-react"],
  allowedDevOrigins: ["*"],
};

module.exports = nextConfig;
