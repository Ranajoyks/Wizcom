export interface CreateGroup {
    companyId: string
    creatorId: string
    groupName: string
    members: Member[]
  }
  
  export interface Member {
    memberId: string
  }