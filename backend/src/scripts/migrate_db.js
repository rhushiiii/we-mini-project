import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const hackathons = db.collection('hackathons');
  
  // Format mappings
  await hackathons.updateMany({ format: "remote" }, { $set: { format: "Online" } });
  await hackathons.updateMany({ format: "irl" }, { $set: { format: "Offline" } });
  await hackathons.updateMany({ format: "hybrid" }, { $set: { format: "Hybrid" } });

  // Tag mappings
  const tagMap = {
    "student-friendly": "Student-Friendly",
    "easy win": "Beginner Friendly",
    "last date soon": "Closing Soon",
    "mentor-heavy": "Mentorship",
    "crowd favorite": "Highly Rated",
    "remote": "Online",
    "hybrid": "Hybrid",
    "irl": "Offline",
    "ships fast": "Rapid Prototyping",
    "real-users": "User-Centric",
    "weird in a good way": "Creative Focus",
    "prototype-heavy": "Prototype Focus",
    "b2b weird": "B2B Focus",
    "quietly lucrative": "High Prize Pool"
  };

  const cursor = hackathons.find({});
  let count = 0;
  for await (const doc of cursor) {
    if (doc.tags && Array.isArray(doc.tags)) {
      const newTags = doc.tags.map(tag => tagMap[tag] || tag);
      // Remove duplicates
      const uniqueTags = [...new Set(newTags)];
      await hackathons.updateOne({ _id: doc._id }, { $set: { tags: uniqueTags } });
      count++;
    }
  }

  console.log(`Updated ${count} documents`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
