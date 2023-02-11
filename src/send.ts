import readline from "readline";
import { saveMessage, userExists } from "./db";
import { writeToLog } from "./logging";

export const sendMessage = async (user: string) => {
    try {
        if (!await userExists(user)) {
            throw new Error("Destination user does not exist");
        }

        getUserMessage().then(async (message) => {
            /// Encrypt the message before saving to database using an arbitrary internally-known secret key
            var CryptoJS = require("crypto-js");
            var ciphertext = CryptoJS.AES.encrypt(message, 'U2FsdGVkX1+DWkJSqNMRIESmxlBgLg9MS42do4T+cKU=').toString();
            // console.log(ciphertext);
            await saveMessage(ciphertext, user);
        });

        /// Record that a message was sent in the log
        writeToLog("Sent message to: " + user)

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