const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { readdirSync } = require("fs");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

mongoose
    .connect(process.env.MONGODB_ACCESS, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected :D"))
    .catch((e) => console.log(e));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({limit: "3mb"}));
app.use(cors());

readdirSync("./routes").map((route) => app.use("/api", require(`./routes/${route}`)));

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}.`));
