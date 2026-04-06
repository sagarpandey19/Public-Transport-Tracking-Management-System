// One-time script to promote Sagar to admin
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function promoteAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOneAndUpdate(
      { name: { $regex: /sagar/i } },
      { role: "admin" },
      { new: true }
    );

    if (user) {
      console.log(`✅ Promoted: ${user.name} (${user.email}) → role: ${user.role}`);
    } else {
      console.log("❌ No user matching 'Sagar' found.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

promoteAdmin();
