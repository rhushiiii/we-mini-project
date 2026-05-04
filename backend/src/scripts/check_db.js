import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const items = await mongoose.connection.db.collection('hackathons').find({ status: { $in: ['OPEN', 'UPCOMING'] } }).toArray();
  console.log('OPEN/UPCOMING Count:', items.length);
  process.exit(0);
});
