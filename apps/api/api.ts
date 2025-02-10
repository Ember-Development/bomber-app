import { Request, Response } from "express";

import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_: Request, res: Response) => {
  res.send("Ready 4 Biznes");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
