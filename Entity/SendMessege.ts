export interface SendMessege {
    companyId: number
    senderId: string
    receiverId: string
    InvokeMessage: string
    msgflag: "U" | "F" | "G"
    itype: number
}