import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Database Connected"));

  // Only append /prescripto if it's not already in the URI
  const uri = process.env.MONGODB_URI.includes('?')
    ? process.env.MONGODB_URI.split('?')[0].endsWith('/prescripto') ? process.env.MONGODB_URI : process.env.MONGODB_URI.replace(/\/?(\?.*)?$/, '/prescripto$1')
    : process.env.MONGODB_URI.endsWith('/prescripto') ? process.env.MONGODB_URI : `${process.env.MONGODB_URI}/prescripto`;

  await mongoose.connect(uri);
};

export default connectDB;
