import { askQuestionEndpoint, conversationsEndpoint, queriesEndpoint } from "./endpoints";
function getCSRFToken() {
  const token = document.querySelector('meta[name="device-monkey"]')!.getAttribute("content");
  if (token) return token;
  else return "";
}

export const askQuestion = async (query: string, sourceId: string): Promise<string> => {
  const response = await fetch(askQuestionEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken(),
    },
    body: JSON.stringify({
      question: query,
      sourceId: sourceId,
    }),
  });
  const responseData = await response.json();
  return responseData.answer;
};

export const postQuery = async (question: string, answer: string, conversationId: number) => {
  const query = {
    question: question,
    answer: answer,
    conversation: conversationId,
  };
  const response = await fetch(queriesEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken(),
    },
    body: JSON.stringify(query),
  });
  return response.json();
};
