import { useState, useEffect } from "react";
import "./App.css";
import { askQuestion, postQuery } from "./utilities/fetchFunctions";
import {
  Query,
  Conversation,
  selectConvInterface,
} from "./types/DataInterfaces";
import { queriesEndpoint, conversationsEndpoint } from "./utilities/endpoints";
import ConversationWidget from "./components/ConversationWidget/ConversationWidget";
import QueriesWidget from "./components/QueriesWidget/QueriesWidget";
function App() {
  const [queryData, setQueryData] = useState<Query[]>([]);
  const [conversationData, setConversationData] = useState<Conversation[]>();
  const [selectedConversation, setSelectedConversation] = useState<
    selectConvInterface[]
  >([]);
  const [questionField, setQuestionField] = useState("");
  useEffect(() => {
    fetchQueries();
    fetchConversations();
  }, []);
  useEffect(() => {
    const scrollHeight = document.querySelector(".queries")?.scrollHeight;
    scrollHeight && document.querySelector(".queries")?.scroll(0, scrollHeight);
  }, [queryData]);
  const fetchQueries = async () => {
    try {
      const response = await fetch(queriesEndpoint);
      if (!response.ok) {
        throw new Error("Queries network response was not ok");
      }

      const data = await response.json();
      setQueryData(data);
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
      const data = await response.json();
      setConversationData(data);
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
    if (selectedConversation.length < 1) {
      alert("A conversation should be selected");
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
        <ConversationWidget
          conversationData={conversationData}
          setConversationData={setConversationData}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
        />
      )}
      {selectedConversation.length > 0 ? (
        <div className="chat">
          <div className="queries-container">
            {selectedConversation.map((el, idx) => (
              <QueriesWidget queryData={queryData} convId={el.id} key={idx} />
            ))}
          </div>
          {selectedConversation.length > 0 && (
            <form className="questionForm" onSubmit={handleSendData}>
              <div className="questionLabel">Question:</div>
              <input
                type="text"
                id="q"
                name="q"
                className="questionField"
                value={questionField}
                onChange={(e) => {
                  setQuestionField(e.target.value);
                }}
              ></input>
              <button className="questionButton" type="submit">
                Submit query
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="loading">Conversation must be selected..</div>
      )}
    </div>
  );
}

export default App;
