import { useState, useEffect } from "react";
import "./App.css";
interface Query {
  id: number;
  question: string;
  answer: string;
  conversation: number;
}
interface Conversation {
  id: number;
  name: string;
  pdf: File;
  sourceId: string;
  uploadDate: Date;
  Queries?: Query[];
}
interface selectConvInterface {
  id: number;
  sourceId: string;
}
const addPdfEndpoint = `${import.meta.env.VITE_UPLOAD_PDF}`;
const queriesEndpoint = `${import.meta.env.VITE_API_URL}queries/`;
const conversationsEndpoint = `${import.meta.env.VITE_API_URL}conversations/`;
const askQuestionEndpoint = `${import.meta.env.VITE_ASK_QUESTION}`;

const ConversationWidget = ({
  conversationData,
  setSelectedConversation,
}: {
  conversationData: Conversation[];
  setSelectedConversation: (conv: selectConvInterface) => void;
}) => {
  return (
    <div className="conversationWidget">
      <h2>Conversations</h2>
      <ul>
        {conversationData.map((el) => (
          <li
            className="unSelected"
            key={el.id}
            onClick={(e) => {
              const lists = document.getElementsByTagName("li");
              for (let i = 0; i < lists.length; i++) {
                lists[i].className = "unSelected";
              }
              e.currentTarget.className = "Selected";
              setSelectedConversation({ id: el.id, sourceId: el.sourceId });
            }}
          >
            <div key={el.id + "n"}>name: {el.name}</div>
            <div key={el.id + "d"}>
              PdfUploadDate: {new Date(el.uploadDate).toISOString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

function App() {
  const [queryData, setQueryData] = useState<Query[]>([]);
  const [conversationData, setConversationData] = useState<Conversation[]>([]);
  const [questionField, setQuestionField] = useState("");
  const [fileField, setFileField] = useState<File>();
  const [selectedConversation, setSelectedConversation] =
    useState<selectConvInterface>();

  useEffect(() => {
    console.log(queryData);
  }, [queryData]);

  const fetchData = async () => {
    try {
      const response = await fetch(queriesEndpoint);
      if (!response.ok) {
        throw new Error("Queries network response was not ok");
      }

      const data = await response.json();
      data.forEach((query: Query) => {
        console.log(query.conversation);
      });
      setQueryData(data);
    } catch (error) {
      console.log(error);
    }

    try {
      const response = await fetch(conversationsEndpoint);
      if (!response.ok) {
        throw new Error("Conversations network response was not ok ");
      }
      const data = await response.json();
      data.forEach((conversation: Conversation) => {
        console.log(conversation);
      });
      setConversationData(data);
    } catch (error) {
      console.log(error);
    }
  };
  const askQuestion = async (query: string): Promise<string> => {
    const response = await fetch(askQuestionEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: query,
        sourceId: selectedConversation?.sourceId,
      }),
    });
    const responseData = await response.json();
    return responseData.answer;
  };

  const postData = async (question: string, answer: string) => {
    const query = {
      question: question,
      answer: answer,
      conversation: selectedConversation?.id,
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

  const postPdf = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(addPdfEndpoint, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload PDF");
      }
      return response.json();
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    }
  };
  useEffect(() => {
    console.log(selectedConversation);
  }, [selectedConversation]);

  const handleSendData = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!questionField.trim()) {
      alert("Question field is required");
      return;
    }
    if (!selectedConversation) {
      alert("A conversation should be selected");
      return;
    }
    try {
      const newData = await postData(
        questionField,
        await askQuestion(questionField)
      );
      if (newData) {
        setQueryData((prevstate) => [...prevstate, newData]);
      }
      setQuestionField("");
    } catch (error) {
      console.log(error);
    }
  };
  const uploadPdf = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fileField)
      try {
        let response = await postPdf(fileField);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    else alert("upload file");
  };
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    console.log(fileField);
  }, [fileField]);

  return (
    <div className="main-container">
      {conversationData && (
        <ConversationWidget
          conversationData={conversationData}
          setSelectedConversation={setSelectedConversation}
        />
      )}
      <div className="chat">
        <ul className="queries">
          {queryData &&
            queryData.map((el) => (
              <li key={el.id}>
                <div>
                  Id: {el.id} ConversationID: {el.conversation}
                </div>
                <div>Question: {el.question}</div>
                <div>Answer: {el.answer}</div>
              </li>
            ))}
        </ul>

        <form onSubmit={handleSendData}>
          <label htmlFor="q">Question:</label>
          <br></br>
          <input
            type="text"
            id="q"
            name="q"
            value={questionField}
            onChange={(e) => {
              setQuestionField(e.target.value);
            }}
          ></input>
          <br></br>
          <button type="submit">Submit query</button>
        </form>
        <form onSubmit={uploadPdf}>
          <label htmlFor="f">Upload pdf</label>

          <input
            type="file"
            id="f"
            name="f"
            accept=".pdf"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                const ext = files[0].type;
                if (ext === "application/pdf") {
                  setFileField(files[0]);
                } else {
                  e.target.value = "";
                  alert("wrong file format");
                }
              }
            }}
          ></input>
          <br></br>
          <br></br>
          <button type="submit">Upload pdf</button>
        </form>
      </div>
    </div>
  );
}

export default App;
