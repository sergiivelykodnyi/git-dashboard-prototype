import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/api.js";

const app = express();
app.use(cors({ origin: /^http:\/\/localhost(:\d+)?$/ }));
app.use(express.json());
app.use(express.static("public"));

app.use("/api", apiRouter);

const PORT = process.env.PORT || 5800;
app.listen(PORT, () => {
  console.log(
    `\n🚀 Git Dashboard Server running at http://localhost:${PORT}\n`,
  );
});
