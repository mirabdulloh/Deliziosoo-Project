import express from "express";
import cors from "cors";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import { MORGAN_FORMAT } from "./libs/config";
import cookieParser from "cookie-parser";
import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";
import MemberModel from "./schema/Member.model";
import {
  getAllowedOrigins,
  getCookieSameSite,
  getCookieSecure,
  getServerBaseUrl,
  isLocalDevOrigin,
  isProduction,
} from "./libs/runtime";

const MongoDBStore = ConnectMongoDB(session);
const allowedOrigins = getAllowedOrigins();
const publicStaticMaxAge = isProduction ? "1h" : 0;
const uploadStaticMaxAge = isProduction ? "365d" : 0;

const store = new MongoDBStore({
  uri: String(process.env.MONGO_URL),
  collection: "sessions",
});

store.on("error", (err) => {
  console.error("Session store error:", err);
});

/** Entrance  */

const app = express();

if (isProduction) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: publicStaticMaxAge,
    etag: true,
    lastModified: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (!isProduction && isLocalDevOrigin(origin))
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin is not allowed"));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    maxAge: uploadStaticMaxAge,
    etag: true,
    lastModified: true,
    immutable: isProduction,
  }),
);

app.use(morgan(MORGAN_FORMAT));

/** Sessions   */

app.use(
  session({
    secret: String(process.env.SESSION_SECRET),
    name: "delizioso.sid",
    cookie: {
      maxAge: 1000 * 3600 * 6, // 6h
      httpOnly: true,
      sameSite: getCookieSameSite(),
      secure: getCookieSecure(),
    },
    store: store,
    resave: false,
    saveUninitialized: false,
    proxy: isProduction,
  }),
);

app.use(async (req, res, next) => {
  const s = req.session as any;

  if (s?.member?._id) {
    const now = Date.now();

    // avoid updating DB on every request
    if (!s.lastActivePing || now - s.lastActivePing > 60_000) {
      s.lastActivePing = now;

      void MemberModel.updateOne(
        { _id: s.member._id },
        { $set: { lastActiveAt: new Date() } },
      )
        .exec()
        .catch((err) => {
          console.error("Failed to update member activity:", err);
        });
    }
  }

  next();
});

app.use(function (req, res, next) {
  const sessionInstance = req.session as T;
  res.locals.member = sessionInstance.member;
  next();
});

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.serverApi = getServerBaseUrl(req);
  next();
});

/** Views  */

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

/** Routers  */

app.use("/admin", routerAdmin);
app.use("/", router);

export default app;
