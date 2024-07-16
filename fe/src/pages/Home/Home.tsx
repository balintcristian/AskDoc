import { useState, useEffect } from "react";
import "./Home.css";
import { Conversation, Query, selectConvInterface, User } from "../../types/DataInterfaces";
import api from "../../api/api";
import { conversationsEndpoint, me, queriesEndpoint } from "../../helpers/endpoints";
import { askQuestion, postQuery } from "../../helpers/fetchFunctions";
import ConversationsWidget from "../../components/ConversationsWidget/ConversationsWidget";
import QueriesWidget from "../../components/QueriesWidget/QueriesWidget";

function App() {
  const [userData, setUserData] = useState<User>();
  const [queryData, setQueryData] = useState<Query[]>([]);
  const [conversationData, setConversationData] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<selectConvInterface[]>([]);
  const [questionField, setQuestionField] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const downloadNote = () => {
    try {
      if (note == "") {
        alert("No note to download");
        return;
      }

      const blob = new Blob([note], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "note.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchQueries();
    fetchConversations();
    fetchUserData();
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
      setQueryData(await (await api.get(queriesEndpoint)).data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConversations = async () => {
    try {
      setConversationData(await (await api.get(conversationsEndpoint)).data);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchUserData = async () => {
    try {
      setUserData(await (await api.get(me)).data);
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
      {conversationData && userData && (
        <ConversationsWidget
          conversationData={conversationData}
          setConversationData={setConversationData}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          queryData={queryData}
          setQueryData={setQueryData}
          userData={userData}
        />
      )}
      <div className="vbar"></div>
      {selectedConversation.length > 0 ? (
        <div className="chat">
          {queryData.length > 0 && (
            <div className="queries-container">
              {selectedConversation.map((el, idx) => (
                <QueriesWidget
                  queryData={queryData.filter((query) => query.conversation == el.id)}
                  key={idx}
                />
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
              value={note}
              onChange={(e) => {
                setNote(e.currentTarget.value);
              }}
            />
            <button className="questionButton" type="submit">
              Submit query
            </button>
          </form>
          <div className="notes">
            <textarea
              className="notesTextarea"
              id="notesTextarea"
              cols={30}
              rows={5}
              value={note}
              onChange={(e) => {
                setNote(e.currentTarget.value);
              }}
            ></textarea>
            <button type="button" id="a" onClick={downloadNote}>
              Save
            </button>
          </div>
        </div>
      ) : conversationData.length < 1 ? (
        <div>
          <div className="selectConversation">Create a conversation</div>
          <div className="notesNoChat">
            <textarea
              className="notesTextarea"
              id="notesTextarea"
              cols={30}
              rows={5}
              value={note}
              onChange={(e) => {
                setNote(e.currentTarget.value);
              }}
            ></textarea>
            <button type="button" id="b" onClick={downloadNote}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="selectConversation">Click on conversations to select them</div>
          <div className="notesNoChat">
            <textarea
              className="notesTextarea"
              id="notesTextarea"
              cols={30}
              rows={5}
              value={note}
              onChange={(e) => {
                setNote(e.currentTarget.value);
                console.log(e.target.value, e.currentTarget.value);
              }}
            ></textarea>
            <button type="button" id="c" onClick={downloadNote}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
