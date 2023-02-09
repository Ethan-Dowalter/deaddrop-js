import readline from "readline";
import { writeToLog } from "./logging";

import { noUsers, setUserPassHash, userExists } from "./db";
import { authenticate, getPassword } from "./session";

export const newUser = async (user: string) => {
    try {
        if (!noUsers() && !userExists(user)) {
            throw new Error("User not recognized");
        }

        if (!(await authenticate(user))) {
            throw new Error("Unable to authenticate user");
        }

        let newUser = await getNewUsername();
        let newPassHash = await getPassword();
        
        await setUserPassHash(newUser, newPassHash);

        /// Record that a new user was created in the log
        writeToLog("New user created: " + newUser);

    } catch (error) {
        console.error("Error ocurred creating a new user.", error);
    }
}

const getNewUsername = async (): Promise<string> => {
    let rl = readline.createInterface(process.stdin, process.stdout);
    let username: string = await new Promise(resolve => rl.question("Username: ", resolve));
    return username;
}