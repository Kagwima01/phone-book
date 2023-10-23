const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://Kagwima:${password}@cluster0.juhvnkz.mongodb.net/phoneBookApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
});
const Contact = mongoose.model("Contact", contactSchema);

if (process.argv.length === 3) {
  Contact.find({}).then((result) => {
    result.forEach((contact) => {
      console.log(contact);
    });
    mongoose.connection.close();
  });
}

if (process.argv.length === 5) {
  const name = process.argv[3];
  const number = process.argv[4];

  const contact = new Contact({
    name: name,
    number: number,
  });
  contact.save().then((result) => {
    console.log(`${result.name} added to phone book`);
    mongoose.connection.close();
  });
}
