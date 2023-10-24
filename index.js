const express = require("express");
const app = express();
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

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// this has to be the last loaded middleware.

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static("dist"));

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  Contact.find({}).then((contacts) => {
    response.json(contacts);
  });
});
app.get("/api/info", (request, response) => {
  const currentDate = new Date();
  Contact.find({}).then((contacts) => {
    response.send(
      `<h4>phonebook has info for ${contacts.length} people</h4><h5>${currentDate}</h5>`
    );
  });
});
app.get("/api/persons/:id", (request, response) => {
  Contact.findById(request.params.id)
    .then((contact) => {
      if (contact) {
        response.json(contact);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response) => {
  Contact.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
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

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const contact = {
    name: body.name,
    number: body.number,
  };

  Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
    .then((updatedContact) => {
      response.json(updatedContact);
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
