import api from "../api/api";
import { askQuestionEndpoint, queriesEndpoint } from "./endpoints";

export const askQuestion = async (query: string, sourceId: string): Promise<string> => {
  const response = await api.post(
    askQuestionEndpoint,
    JSON.stringify({
      question: query,
      sourceId: sourceId,
    })
  );
  const responseData = await response.data;
  return responseData.answer;
};

export const postQuery = async (question: string, answer: string, conversationId: number) => {
  const query = {
    question: question,
    answer: answer,
    conversation: conversationId,
  };
  const response = await api.post(queriesEndpoint, query);
  const responseData = await response.data;
  return responseData;
};
