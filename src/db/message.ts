import { connect } from "./db"

export const getMessagesForUser = async (user: string): Promise<string[][]> => {
    let db = await connect();

    let messages: string[][] = [];

    await db.each(`
        SELECT data, mac, sender FROM Messages
        WHERE recipient = (
            SELECT id FROM Users WHERE user = :user
        );
    `, {
        ":user": user,
    }, (err, row) => {
        if (err) {
            throw new Error(err);
        }
        messages.push([row.data, row.mac, row.sender]);
    });

    return messages;
}

export const saveMessage = async (message: string, recipient: string, mac: string, sender: string) => {
    let db = await connect();

    await db.run(`
        INSERT INTO Messages 
            (recipient, data, mac, sender)
        VALUES (
            (SELECT id FROM Users WHERE user = :user),
            :message,
            :mac,
            :sender
        )
    `, {
        ":user": recipient,
        ":message": message,
        ":mac": mac,
        ":sender": sender,
    });
}