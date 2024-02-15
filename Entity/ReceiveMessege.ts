export interface ReceiveMessege {
  sender: number;
  receiver: number;
  message: string;
}
export interface ReceiveGroupMessage {
  fromUserId: number,
  userName: string,
  groupName: string,
  AttachmentID:number,
  message: string,
}
