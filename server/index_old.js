// imports
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ObjectId = require("mongodb").ObjectId;
const MongoClient = require("mongodb").MongoClient;

const mongoClient = new MongoClient(process.env.DB_URL_LOCAL);
const PORT = process.env.PORT || 5000;
const app = express();
const jsonParser = express.json();

app.use(express.static(`${__dirname}/public`));

const start = async () => {
  try {
    await mongoClient.connect();
    console.log("Подключение установлено");
    app.locals.collection = mongoClient.db("usersdb").collection("users");
    app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));
  } catch (error) {
    console.log(error);
  } finally {
    // await mongoClient.close();
    // console.log("Подключение закрыто");
  }
};

start();

app.get("/api/users", async (req, res) => {
  const collection = req.app.locals.collection;

  try {
    const users = await collection.find({}).toArray();
    res.send(users);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.get("/api/users/:id", async (req, res) => {
  const collection = req.app.locals.collection;

  try {
    const id = new ObjectId(req.params.id);
    const user = collection.find({ _id: id }).toArray();
    // 200 user founded
    if (user) res.send(user);
    else res.sendStatus(404); // not fount;
  } catch (error) {
    console.log(error);
    // eternal error
    res.sendStatus(500);
  }
});

app.post("/api/users/", jsonParser, async (req, res) => {
  if (!req.body) return res.sendStatus(400);

  const name = req.body.name;
  const age = req.body.age;
  const user = { name, age };

  const collection = req.app.locals.collection;

  try {
    await collection.insertOne(user);
    res.send(user);
  } catch (error) {
    console.log(error);
    // eternal error
    res.sendStatus(500);
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const collection = req.app.locals.collection;
  try {
    const id = new ObjectId(req.params.id);
    const result = await collection.findOneAndDelete({ _id: id });
    const user = result.value;
    if (user) res.send(user);
    else res.sendStatus(404);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.put("/app/users/", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);

  const name = req.body.name;
  const age = req.body.age;

  const collection = req.app.locals.collection;

  try {
    const id = new ObjectId(req.body.id);

    const result = collection.findOneAndUpdate(
      { _id: id },
      { $set: { name, age } },
      { returnDocument: "after" }
    );
    const user = result.value;
    if (user) res.send(user);
    else res.sendStatus(404);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

process.on("SIGINT", async () => {
  await mongoClient.close();
  console.log("Приложение завершило работу");
  process.exit();
});
