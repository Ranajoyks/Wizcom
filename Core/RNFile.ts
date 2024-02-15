export default class RNFile {
    uri?: string;
    type?: string;
    name?: string;
    Size?: number;
    DocumentId?: string;
    constructor(uri?: string, type?: string, name?: string, Size?: number, DocumentId?: string) {
        this.uri = uri;
        this.type = type;
        this.name = name;
        this.Size = Size;
        this.DocumentId = DocumentId;
    }
}