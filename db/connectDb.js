import mongoose from "mongoose";

const connectDb = async () => {
    const conn = await mongoose.connect(process.env.MONGO_DB_URI, {
        dbName: "WebAuth-DB",
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    return conn;
};

export default connectDb;
