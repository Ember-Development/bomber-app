import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

const router = express.Router();
app.use("/api", router);

router.get("/", (_, res) => {
  res.status(200).send("Ready 4 The Squeakquel");
});

//TODO: .env
server.listen(5000, () => {
  console.log(`Server is running at http://localhost:${5000}`);
});
