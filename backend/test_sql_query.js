
import { sequelize } from "./config/db.js";

const testQuery = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        const query = `SELECT count(*) as count FROM "Orders"`;
        const [results] = await sequelize.query(query);
        console.log("Query success. Count:", results[0]);

    } catch (error) {
        console.error("Query failed:", error.message);
    } finally {
        await sequelize.close();
    }
};

testQuery();
