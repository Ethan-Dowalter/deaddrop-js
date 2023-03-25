import readline from "readline";
import { saveMessage, userExists, getUserId } from "./db";
import { writeToLog } from "./logging";
import { authenticate } from "./session";
import { getNewUsername } from "./new";

export const sendMessage = async (user: string) => {
    try {
        if (!await userExists(user)) {
            throw new Error("Destination user does not exist");
        }
    } catch (error) {
        /// Record attempt to send message to a non-existant user in the log
        writeToLog("Tried to send message to non-existant user: " + user);
        return
    }

    /// Get the sender of the message and authenticate them
    const sender = await getNewUsername();
    try {
        if (!await authenticate(sender)) {
            throw new Error("Unable to authenticate");
        }
    } catch (error) {
        console.log("Unable to authenticate");
        return
    }

    try {
        getUserMessage().then(async (message) => {
            /// Encrypt the message and generate MAC before saving to database using an arbitrary internally-known secret key
            const CryptoJS = require("crypto-js");
            const ciphertext = CryptoJS.AES.encrypt(message, 'U2FsdGVkX1+DWkJSqNMRIESmxlBgLg9MS42do4T+cKU=').toString();
            const mac = CryptoJS.HmacSHA3(message, 'U2FsdGVkX1+DWkJSqNMRIESmxlBgLg9MS42do4T+cKU=').toString();
            await saveMessage(ciphertext, user, mac, sender);
        });

        /// Record that a message was sent in the log
        writeToLog(sender + " sent message to " + user)

    } catch (error) {
        /// Record attempt to send message to a non-existant user in the log
        writeToLog("Tried to send message to non-existant user: " + user);
        
        console.error("Error occured creating a new user.", error);
    }
}

const getUserMessage = async (): Promise<string> => {
    let rl = readline.createInterface(process.stdin, process.stdout);
    let message: string = await new Promise(resolve => rl.question("Enter your message: ", resolve));
    rl.close();
    return message;
}