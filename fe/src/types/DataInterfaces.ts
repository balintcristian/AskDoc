export interface Query {
  id: number;
  question: string;
  answer: string;
  conversation: number;
}
export interface Conversation {
  id: number;
  name: string;
  pdf: File;
  sourceId: string;
  uploadDate: Date;
  Queries?: Query[];
}
export interface selectConvInterface {
  id: number;
  sourceId: string;
}
