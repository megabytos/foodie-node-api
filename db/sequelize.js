import {Sequelize} from "sequelize";
import path from 'node:path';
import "dotenv/config";

const {DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, DB_DIALECT} = process.env;

const sequelize = new Sequelize({
    dialect: DB_DIALECT,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASS,
    dialectOptions: {
        ssl: true,
    },
    models: [path.join(process.cwd(), "db", "models")],
});

try {
    await sequelize.authenticate();
    console.log("Database connection successful");
} catch (error) {
    console.error("Unable to connect to the database: ", error);
    process.exit(1);
}

export default sequelize;