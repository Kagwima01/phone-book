const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const Contact = require("./models/contact");

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

let persons = [];

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((p) => p.id)) : 0;
  return maxId + 1;
};

app.get("/api/persons", (request, response) => {
  Contact.find({}).then((contacts) => {
    response.json(contacts);
  });
});
app.get("/api/info", (request, response) => {
  const currentDate = new Date();

  response.send(
    `<h4>phonebook has info for ${persons.length} people</h4><h5>${currentDate}</h5>`
  );
});
app.get("/api/persons/:id", (request, response) => {
  Contact.findById(request.params.id).then((contact) => {
    response.json(contact);
  });
});
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});
app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({
      error: "Missing name or number",
    });
  }
  const contact = new Contact({
    name: body.name,
    number: body.number,
  });
  contact.save().then((savedContact) => {
    response.json(savedContact);
  });
});

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
