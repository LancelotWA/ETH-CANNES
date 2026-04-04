export default () => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  backendPort: Number(process.env.BACKEND_PORT ?? 4000),
  appOrigin: process.env.APP_ORIGIN ?? "http://localhost:3000",
  ethereumRpcUrl: process.env.ETHEREUM_RPC_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "unsafe-dev-secret",
  unlink: {
    apiKey: process.env.UNLINK_API_KEY ?? "",
    apiUrl: process.env.UNLINK_API_URL ?? "https://staging-api.unlink.xyz",
  },
  rateLimit: {
    ttl: Number(process.env.RATE_LIMIT_TTL ?? 60),
    limit: Number(process.env.RATE_LIMIT_LIMIT ?? 20)
  }
});
