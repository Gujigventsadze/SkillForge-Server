import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const port = 3001;
const saltRounds = 15;
app.use(cors());
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const connectToDb = async () => {
  try {
    await db.connect();
    console.log("Connected to Database");
  } catch (e) {
    console.log(e.message);
  }
};
connectToDb();

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const queryResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (queryResult.rows.length > 0) {
      return res.send("User Already Exists");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
      email,
      hashedPassword,
    ]);

    res.send("User successfully registered");
  } catch (e) {
    console.log(e.message);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => console.log(`Listening to port ${port}`));
