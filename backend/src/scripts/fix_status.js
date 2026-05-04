import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const hackathons = db.collection('hackathons');
  
  await hackathons.updateMany(
    { $or: [{ status: null }, { status: { $exists: false } }] },
    { $set: { status: "OPEN" } }
  );

  console.log('Fixed statuses!');
  process.exit(0);
});
