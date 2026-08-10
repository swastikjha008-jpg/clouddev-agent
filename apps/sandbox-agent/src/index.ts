import Fastify from "fastify";
import { registerRoutes } from "./routes.js";

const port = Number(process.env.PORT ?? 7717);

const app = Fastify({ logger: true });

await app.register(registerRoutes);

app
  .listen({ port, host: "0.0.0.0" })
  .then((address) => app.log.info(`sandbox-agent listening on ${address}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
