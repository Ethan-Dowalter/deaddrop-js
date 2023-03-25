import { getMessagesForUser, userExists } from "./db";
import { authenticate } from "./session";
import { writeToLog } from "./logging";

export async function readMessages(user: string) {
    try {
        if (!await userExists(user)) {
            throw new Error("User does not exist");
        }
    } catch (error) {
        /// Record attempt to read messages from a non-existant user in the log
        writeToLog("Tried to read messages from non-existant user: " + user);
        return
    }

    try {
        if (!await authenticate(user)) {
            throw new Error("Unable to authenticate");
        }

        getMessagesForUser(user).then((messages) => {
            /// message_mac_sender is a list of 3 things: the encrypted message, the message authentication code, and the sender of the message (in that order)
            messages.forEach((message_mac_sender: string[]) => {
                /// Decrypt and check integrity of the messages with our MAC and arbitrary internally-known secret key
                const CryptoJS = require("crypto-js");
                const bytes = CryptoJS.AES.decrypt(message_mac_sender[0], 'U2FsdGVkX1+DWkJSqNMRIESmxlBgLg9MS42do4T+cKU=');
                const originalText = bytes.toString(CryptoJS.enc.Utf8);
                const check_mac = CryptoJS.HmacSHA3(originalText, 'U2FsdGVkX1+DWkJSqNMRIESmxlBgLg9MS42do4T+cKU=').toString();
                if (message_mac_sender[1] != check_mac){
                    /// Record that a message was changed in the log and tell user
                    writeToLog("Message integrity of message '" + message_mac_sender[0] + "' could not be verified for user " + user);
                    console.log("Error: Message integrity could not be verified!");
                }
                else{
                    /// Print message to user
                    console.log("From " + message_mac_sender[2] + " - " + originalText + "\n");
                }
            })
        });

        /// Record that a user read their messages in the log
        writeToLog(user + " read their messages")

    } catch (error) {
        console.error("Error occured during reading.", error);
    }
}