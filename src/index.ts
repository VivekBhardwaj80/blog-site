import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";

// custom
import mainRouter from "./routes/mainRoutes.js";
import limiter from "./lib/expressRateLimit.js";
import { dbConnect } from "./lib/db.js";
import { disconnect } from "node:cluster";

config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: process.env.HOST_URI || "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(
  compression({
    threshold: 1024, // only compare responses larger than 1KB
  })
);
app.use(limiter);

// route
app.use("/api/v1", mainRouter);

app.listen(port,async () => {
    try {
        
        console.log(`server running at ${port} port`)
        await dbConnect()
    } catch (error:any) {
        console.log('error to connect DB')
        await disconnect()
        process.exit(1)
    }
});
