# End To End Encrypted Chat
This is an end to end encrypted chat application build on top of Rabbitmq.

### Features
- End to end encrypted chat
- User authentication

### Technologies Used
- Rabbitmq (amqp) for pub/sub
- Nodejs
- Expressjs
- Socket.IO
- Postgresql
- ReactJS (with ChakraUI and Zustand)
- Docker (for setting up pg and rabbitmq)

- [ECDH](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman) algorithm for generating shared secret key
- AES encryption

### Motivation
I had learnt about Event brokers and message queues in the past. And I was quite interested in cryptography that I had previously took a course on it. I wanted to learn how to use it in a real world application. And this felt like the perfect project for learning both.

### Challenges faced
I first used Deffie-Hellman algorithm to generate shared secret key. But there wasn't any package available to do so in the browser. So I had to research a bit and found out ECDH method, and it had a great open source package available.

This was a learning project where I focused on learning software architecture design, so I used a lot of libraries on the frontend instead of doing to from scratch.

It was quite hard because I had to learn about event brokers and how to use them. I tried out Kafka, heard about few others from friends and eventually settled for rabbitmq because of how straightforward it was.

There was also a lot of thinking and planning required to get the project up and running. More so I was thinking than writing any code.

### How it works
1. User registers and logs in
2. A private key is generated and stored on browser.
3. A public key is generated and stored on server.
4. When user sends message to another user (through SocketIO), the other user's public key is used to generate a shared encrypted key and the message is encrypted using the shared secret key before being sent.
5. The server now receives the message (encrypted) and adds to a Rabbitmq Queue (each user had individual queues).
6. Once the other user logs in, the Rabbitmq queue is consumed and the message is sent back through SocketIO.
7. The other user now uses the first users public key to generate the shared secret key and decreypts the message.
8. The message is then stored on other users browser.

Thank you for reading so far :D
Enjoy! Any contributions are welcome.