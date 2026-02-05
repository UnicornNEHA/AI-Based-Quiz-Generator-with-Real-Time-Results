// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, unique: true, lowercase: true },
//     password: { type: String, required: true, minlength: 6 }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);
// Temporary mock for testing without MongoDB
let users = []; // in-memory storage

class User {
  constructor({ name, email, password }) {
    this.id = users.length + 1;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  static async create(data) {
    const user = new User(data);
    users.push(user);
    return user;
  }

  static async findOne(query) {
    return users.find(u => u.email === query.email) || null;
  }

  static async findById(id) {
    return users.find(u => u.id === id) || null;
  }

  select() {
    return { id: this.id, name: this.name, email: this.email }; // ignore password
  }
}

module.exports = User;
