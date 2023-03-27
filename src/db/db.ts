import sqlite3 from "sqlite3";
import { existsSync } from "fs";
import { exit } from "process";
import { Database, open } from "sqlite";

const schema: string = `
CREATE TABLE Users (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user TINYTEXT NOT NULL,
    hash TEXT NOT NULL
);

CREATE TABLE Messages (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    recipient INTEGER NOT NULL REFERENCES Users(id),
    data TEXT NOT NULL,
    mac TEXT NOT NULL,
    sender TEXT NOT NULL
);

CREATE TRIGGER stop_mac_update BEFORE UPDATE OF mac ON Messages
BEGIN
    SELECT raise(abort, "You're not allowed to change the MACs!");
END;

CREATE TRIGGER stop_sender_update BEFORE UPDATE OF sender ON Messages
BEGIN
    SELECT raise(abort, "You're not allowed to change the sender!");
END;
`

export const connect = async (): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
    try {
        let mustInitDb = false;
        if (!existsSync("dd.db")) {
            mustInitDb = true;
        }

        return await open({
            filename: "dd.db",
            driver: sqlite3.Database,
        }).then(async (db) => {
            if (mustInitDb) {
                await db.exec(schema);
            }
            return db
        }).then(async (db) => await db);

    } catch (error) {
        console.error(error)
        exit();
    }
}
