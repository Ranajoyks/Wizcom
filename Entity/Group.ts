import { ChatUser } from "./ChatUser";
import { GroupChat } from "./GroupChat";

export interface Group {
  groupId: number;
  groupName: string;
  lastMessage: string;


  AllGroupMsgList?: GroupChat[]
  sMessgeList: GroupChat[],
  members: GroupMember[]
}

export interface GroupMember {
  memberId: string;
  fullName: string;
  isOwner: boolean;
}