import { askQuestionEndpoint, queriesEndpoint } from "./endpoints";
export const askQuestion = async (
  query: string,
  sourceId: string
): Promise<string> => {
  const response = await fetch(askQuestionEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: query,
      sourceId: sourceId,
    }),
  });
  const responseData = await response.json();
  return responseData.answer;
};

export const postQuery = async (
  question: string,
  answer: string,
  conversationId: number
) => {
  const query = {
    question: question,
    answer: answer,
    conversation: conversationId,
  };
  const response = await fetch(queriesEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });
  return response.json();
};
