import { getMessagesForUser, userExists } from "./db";
import { authenticate } from "./session";
import { writeToLog } from "./logging";

export async function readMessages(user: string) {
    try {
        if (!await userExists(user)) {
            /// Record attempt to read messages from a non-existant user in the log
            writeToLog("Tried to read messages from non-existant user: " + user);

            throw new Error("User does not exist");
        }

        if (!await authenticate(user)) {
            throw new Error("Unable to authenticate");
        }

        getMessagesForUser(user).then((messages) => {
            messages.forEach((e: string) => {
                /// Decrypt the messages with our arbitrary internally-known secret key
                var CryptoJS = require("crypto-js");
                var bytes = CryptoJS.AES.decrypt(e, 'U2FsdGVkX1+DWkJSqNMRIESmxlBgLg9MS42do4T+cKU=');
                var originalText = bytes.toString(CryptoJS.enc.Utf8);
                console.log(originalText, "\n");
            })
        });

        /// Record that a user read their messages in the log
        writeToLog(user + " read their messages")

    } catch (error) {
        console.error("Error occured during reading.", error);
    }
}