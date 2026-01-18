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

const MongoDBStore = ConnectMongoDB(session);

const store = new MongoDBStore({
  uri: String(process.env.MONGO_URL),
  collection: "sessions",
});

/** Entrance  */

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/uploads", express.static("./uploads"));
app.use(morgan(MORGAN_FORMAT));

/** Sessions   */

app.use(
  session({
    secret: String(process.env.SESSION_SECRET),
    cookie: {
      maxAge: 1000 * 3600 * 6, // 6h
    },
    store: store,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(async (req, res, next) => {
  const s = req.session as any;

  if (s?.member?._id) {
    const now = Date.now();

    // avoid updating DB on every request
    if (!s.lastActivePing || now - s.lastActivePing > 60_000) {
      s.lastActivePing = now;

      await MemberModel.updateOne(
        { _id: s.member._id },
        { $set: { lastActiveAt: new Date() } }
      );
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
  next();
});

/** Views  */

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/** Routers  */

app.use("/admin", routerAdmin);
app.use("/", router);

export default app;
