import db from '../models/index.js';

(async () => {
    try {
        await db.sequelize.getQueryInterface().showAllTables().then(async (tables) => {
            if (tables.length > 0) {
                console.log("Tables already exist. Cleaning...");
                await db.sequelize.drop();
            }
            console.log("Generating tables...");
            await db.sequelize.sync({ force: true });
            console.log("All tables were successfully created from models!");
            process.exit();
        });
    } catch (error) {
        console.error("Error creating tables: ", error);
        process.exit(1);
    }
})();
