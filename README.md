#  deaddrop-js

A deaddrop utility written in Typescript. Put files in a database behind a password to be retrieved at a later date.

This is a part of the University of Wyoming's Secure Software Design Course (Spring 2023). This is the base repository to be forked and updated for various assignments. Alternative language versions are available in:
- [Go](https://github.com/andey-robins/deaddrop-go)
- [Rust](https://github.com/andey-robins/deaddrop-rs)

## Versioning

`deaddrop-js` is built with:
- node v18.13.0

## Usage

`npm run build && node dist/index.js --help` for instructions

Then run `node dist/index.js --new --user <username here>` and you will be prompted to create the initial password.

## Database

Data gets stored into the local database file dd.db. This file will not by synched to git repos. Delete this file if you don't set up a user properly on the first go

## Mitigation

The security optimization that I implemented was encrypting the messages with AES symmetric encryption before they get stored in the database. I simply used a long random string for the secret key to encrypt and decrypt the messages. If an attacker got access to the database file AND the source code, they could easily decrypt the messages, but this still adds an additional layer of security so that they would need both in order to read all the messages.

## MAC Strategy

As a part of the MAC assignment, I made two security improvements as detailed in the assignment description. In addition, I added functionality to the log file which I missed last assignment. Now the log file contains the time each line occurred, making the job of auditing much easier. 

One of the two security improvements I implemented is the addition of a message authentication code, which enables users to tell if their messages have been tampered with. Before, a user's messages could be tampered with without the recipient or sender knowing it happened. By creating a hash based on a message as it is being sent, we can store this hash along with the message. Upon the recipient reading their messages, we can check each message with its "message authentication code" (the hash which was created from the original message) to see if the message has been changed or not. 

The other improvement is no longer allowing someone to send a message without authenticating as a user, while also letting the recipients of messages know which user sent it to them. This change helps to mitigate the risk of an attacker flooding the database with messages to drown out any valid message. Also, by authenticating the sender, this allows us to let the recipient know who sent them the message.

Finally, I added triggers to the sqlite database which prevent the updating the these two additional columns (the MAC and sender) within the "Messages" table. This acts as another barrier to attackers, because once written to the database these columns should be immutable to protect the security of the application.