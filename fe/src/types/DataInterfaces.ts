export interface Query {
  id: number;
  question: string;
  answer: string;
  conversation: number;
  uploadDate: Date;
}
export interface User {
  id: number;
  username: string;
}
export interface Conversation {
  id: number;
  name: string;
  pdf: File;
  sourceId: string;
  uploadDate: Date;
  author: string;
}
export interface selectConvInterface {
  id: number;
  sourceId: string;
}
