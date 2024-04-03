const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const { open } = require('sqlite');
const filepath = "./data/minzbot.db";

async function createDbConnection() {
    if (fs.existsSync(filepath)) {
        //new sqlite3.Database(filepath);
        const db = await open({filename: filepath, driver: sqlite3.Database});
        await initDB(db);
        return db;
    } else {
        const db = await open({filename: filepath, driver: sqlite3.Database});
        await initDB(db);
        console.log("[DATABASE] Connection with SQLite has been established");
        return db;
    }
}

async function initDB(db) {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS anniversaries (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            name   VARCHAR(50) NOT NULL,
            guild_id TEXT NOT NULL,
            discord_id   VARCHAR(50) NOT NULL,
            last_anniversary_notification TEXT
        );
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS lastfm (
            discord_id TEXT PRIMARY KEY NOT NULL,
            lastfm_name TEXT
        );
    `);
    console.log('[DATABASE] Created new DB table');
}

module.exports = createDbConnection();