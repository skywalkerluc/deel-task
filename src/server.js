const app = require('./app');
const sequelize = require('./db');

init();

async function init() {
    try {
        await sequelize.sync();
        const port = 3001;
        app.listen(port, () => {
            console.log(`Express App Listening on Port ${port}`);
        });
    } catch (error) {
        console.error(`An error occurred: ${JSON.stringify(error)}`);
        process.exit(1);
    }
}
