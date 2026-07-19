import dotenv from "dotenv";
dotenv.config();

if(!process.env.MONGODB_URI){
    throw new Error("MONGODB_URI is not defined in the environment variables");
};

if(!process.env.JWT_SECRET){
    throw new Error("jwt secret is not definet in environment variable")
};


const config = {
    port: process.env.PORT,
    mongoURI: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
};

export default config;