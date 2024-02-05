export interface GroupDetails {
    group: Group
    members: Member[]
  }
  
  export interface Group {
    groupId: number
    groupName: string
  }
  
  export interface Member {
    fullName: string
    isOwner: boolean
    memberId: string
  }