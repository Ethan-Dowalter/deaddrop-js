import { writeFile } from "fs";

export const writeToLog = async (data: string) => {
    try {
        const present_time = new Date().toLocaleString().replace(',','');
        writeFile('log.txt', present_time + ' - ' + data + '\n', {flag: 'a+'}, function(err){
            if (err) {return console.error(err);}
        });
    } catch (error) {
        console.error("Error ocurred writing to log file.", error);
    }
}