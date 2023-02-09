import { writeFileSync } from "fs";

export const writeToLog = async (data: string) => {
    try {
        writeFileSync('deaddrop.log', data + '\n', {
            flag: 'a'
        });
    } catch (error) {
        console.error("Error ocurred writing to log file.", error);
    }
}