export type Poll ={
    id :	string
    groupId	:string
    question:	string
    options:	Array<string>
    votes:	{yes:Array<string>, no:Array<string>}
    allowMultipleSelection:	Boolean
    totalVotes:	Number
    creatorId	:string
    createdAt:	string
    updatedAt:	string
}