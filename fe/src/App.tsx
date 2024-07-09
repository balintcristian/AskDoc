import { useState, useEffect } from "react";
import "./App.css";
import { askQuestion, postQuery } from "./helpers/fetchFunctions";
import { Query, Conversation, selectConvInterface } from "./types/DataInterfaces";
import { queriesEndpoint, conversationsEndpoint } from "./helpers/endpoints";
import ConversationsWidget from "./components/ConversationsWidget/ConversationsWidget";
import QueriesWidget from "./components/QueriesWidget/QueriesWidget";
function App() {
  const [queryData, setQueryData] = useState<Query[]>([]);
  const [conversationData, setConversationData] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<selectConvInterface[]>([]);
  const [questionField, setQuestionField] = useState("");
  useEffect(() => {
    fetchQueries();
    fetchConversations();
  }, []);
  useEffect(() => {
    const queryElementsList = document.getElementsByClassName("queries");
    if (queryElementsList)
      for (let i = 0; i < queryElementsList.length; i++) {
        queryElementsList[i].scrollTo(0, queryElementsList[i].scrollHeight);
      }
  }, [queryData]);
  const fetchQueries = async () => {
    try {
      const response = await fetch(queriesEndpoint);
      if (!response.ok) {
        throw new Error("Queries network response was not ok");
      }
      setQueryData(await response.json());
    } catch (error) {
      console.log(error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(conversationsEndpoint);
      if (!response.ok) {
        throw new Error("Conversations network response was not ok ");
      }
      setConversationData(await response.json());
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendData = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!questionField.trim()) {
      alert("Question field is required");
      return;
    }
    try {
      selectedConversation.map(async (selected) => {
        await postQuery(
          questionField,
          await askQuestion(questionField, selected.sourceId),
          selected.id
        );
        fetchQueries();
        setQuestionField("");
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="main-container">
      {conversationData && (
        <ConversationsWidget
          conversationData={conversationData}
          setConversationData={setConversationData}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
        />
      )}
      <div className="vbar"></div>
      {selectedConversation.length > 0 ? (
        <div className="chat">
          {queryData.length > 0 && (
            <div className="queries-container">
              {selectedConversation.map((el, idx) => (
                <QueriesWidget queryData={queryData} convId={el.id} key={idx} />
              ))}
            </div>
          )}
          <form className="questionForm" onSubmit={handleSendData}>
            <div className="questionLabel">Question:</div>
            <input
              type="text"
              id="q"
              name="q"
              className="questionField"
              value={questionField}
              onChange={(e) => setQuestionField(e.target.value)}
            />
            <button className="questionButton" type="submit">
              Submit query
            </button>
          </form>
        </div>
      ) : conversationData.length < 1 ? (
        <div className="loading">Createa a conversation</div>
      ) : (
        <div className="loading">Click on conversations to select them</div>
      )}
    </div>
  );
}

export default App;
