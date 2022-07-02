export interface Message {
  content: string;
  // Calculate from or to with this
  senderUid: string;
  recipientUid: string;
  timestamp: number;
}


export interface Chat {
  messages: Message[];
  // Shared diffiehellman secret
  encryptionKey: string;
  // The recipient's username
  chatName: string;

  // Tells which rabbitmq channel to send the message to
  recipientUid: string;
}