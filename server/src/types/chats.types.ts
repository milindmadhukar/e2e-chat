export interface Message {
  content: string;
  // Calculate from or to with this
  senderUid: string;
  recipientUid: string;
  timestamp: number;
}
