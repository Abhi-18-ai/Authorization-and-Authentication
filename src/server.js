import app from "./app.js";
import config from "./config/config.js";
import { connectDB } from "./config/database.js";

connectDB();

const PORT = config.port || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});