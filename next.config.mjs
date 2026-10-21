import createNextIntlPlugin from "next-intl/plugin";

const nextConfig = {};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

export default withNextIntl(nextConfig);