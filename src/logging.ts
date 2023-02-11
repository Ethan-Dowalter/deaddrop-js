import { writeFileSync } from "fs";

export const writeToLog = async (data: string) => {
    try {
        writeFileSync('log.txt', data + '\n', {
            flag: 'a'
        });
    } catch (error) {
        console.error("Error ocurred writing to log file.", error);
    }
}