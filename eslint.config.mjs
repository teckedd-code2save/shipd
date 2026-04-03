import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: ["src/generated/prisma/**"]
  },
  ...nextVitals
];

export default config;
