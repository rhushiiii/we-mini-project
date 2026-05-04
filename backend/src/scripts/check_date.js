import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const doc = await mongoose.connection.db.collection('hackathons').findOne({ deadline: { $ne: null } });
  console.log('Type of deadline:', typeof doc.deadline);
  console.log('Is Date?', doc.deadline instanceof Date);
  console.log('Value:', doc.deadline);
  process.exit(0);
});
