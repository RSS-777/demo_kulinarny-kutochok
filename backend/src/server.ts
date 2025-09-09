import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import logger from "./logger/logger.js";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import favoritesRoutes from "./routes/favoritesRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";
import commentsRoutes from "./routes/commentsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";
import bannedRoutes from "./routes/bannedRoutes.js";
import { generateSitemap } from "./utils/sitemapGenerator.js";
import "./services/cronService.js";

const app = express();
connectDB();
const PORT = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/user/", userRoutes);
app.use("/api/recipe/", recipeRoutes);
app.use("/api/favorite/", favoritesRoutes);
app.use("/api/subscribe/", subscribeRoutes);
app.use("/api/comments/", commentsRoutes);
app.use("/api/admin/", adminRoutes);
app.use("/api/banlist/", bannedRoutes);
app.use("/", sitemapRoutes);

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

generateSitemap()
  .then(() => logger.info("[server] Sitemap generated on server start."))
  .catch((err) =>
    logger.error("[server] Error generating sitemap on server start.")
  );

app.listen(PORT, () => {
  logger.info(`The server is running on port: ${PORT}`);
});
