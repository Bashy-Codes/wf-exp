import { defineApp } from "convex/server";
import r2 from "@convex-dev/r2/convex.config";

const app = defineApp();

// Cloudflare R2 component
app.use(r2);

// Expo Push Notifications component

export default app;
