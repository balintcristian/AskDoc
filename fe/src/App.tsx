import { useState, useEffect } from "react";
import "./App.css";
interface Query {
  id: number;
  question: string;
  answer: string;
  conversationId: number;
}
interface Conversation {
  id: number;
  name: string;
  pdf: File;
  sourceId: string;
  uploadDate: Date;
}
interface selectConvInterface {
  id: number;
  sourceId: string;
}
const addPdfEndpoint = `${import.meta.env.VITE_UPLOAD_PDF}`;
const queriesEndpoint = `${import.meta.env.VITE_API_URL}queries/`;
const conversationsEndpoint = `${import.meta.env.VITE_API_URL}conversations/`;
const askQuestionEndpoint = `${import.meta.env.VITE_ASK_QUESTION}`;
console.log(
  addPdfEndpoint,
  conversationsEndpoint,
  queriesEndpoint,
  askQuestionEndpoint
);

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
            key={el.id}
            onClick={() => {
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
  const fetchData = async () => {
    try {
      const response = await fetch(queriesEndpoint);
      if (!response.ok) {
        throw new Error("Network response was not ok 1");
      }
      const res = await response.json();
      res.forEach((element: any) => {
        console.log(element);
      });
      setQueryData(res);
    } catch (error) {
      console.log(error);
    }
    try {
      const response = await fetch(conversationsEndpoint);
      if (!response.ok) {
        throw new Error("Network response was not ok 2");
      }
      const res = await response.json();
      res.forEach((element: any) => {
        console.log(element);
      });
      setConversationData(res);
    } catch (error) {
      console.log(error);
    }
  };
  const askQuestion = async (query: string) => {
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
    console.log(responseData.answer);
    return responseData.answer;
  };

  const postData = async (question: string, answer: string) => {
    const query = {
      question: question,
      answer: answer,
      conversationId: selectedConversation?.id,
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
    try {
      let newData;
      if (selectedConversation)
        newData = await postData(
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
        <ul>
          {queryData.map((el) =>
            el ? (
              <li key={el.id}>
                <div key={el.id}>Question: {el.question}</div>
                <div key={el.id}>Answer: {el.answer}</div>
              </li>
            ) : (
              <></>
            )
          )}
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
          <button type="submit">Submit query</button>
        </form>
      </div>
    </div>
  );
}

export default App;
