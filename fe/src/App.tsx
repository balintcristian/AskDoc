import { useState, useEffect } from "react";
import "./App.css";
interface Query {
  id: number;
  question: string;
  answer: string;
}
const addPdfEndpoint = `${import.meta.env.VITE_UPLOAD_PDF}`;
const endpoint = `${import.meta.env.VITE_API_URL}queries/`;
const askQuestionEndpoint = `${import.meta.env.VITE_ASK_QUESTION}`;
console.log(addPdfEndpoint, endpoint, askQuestionEndpoint);
function App() {
  const [data, setData] = useState<Query[]>([]);
  const [questionField, setQuestionField] = useState("");

  const [fileField, setFileField] = useState<File>();
  const fetchData = async () => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const res = await response.json();
      console.log(res);
      setData(res);
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
      body: JSON.stringify({ question: query }),
    });
    const responseData = await response.json();
    return responseData.answer;
  };

  const postData = async (question: string, answer: string) => {
    const query = { question: question, answer: answer };
    const response = await fetch(endpoint, {
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

  const handleSendData = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!questionField.trim()) {
      alert("Question field is required");
      return;
    }
    try {
      const newData = await postData(
        questionField,
        await askQuestion(questionField)
      );
      if (newData) {
        setData((prevstate) => [...prevstate, newData]);
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
    <>
      <ul>
        {data.map((el) =>
          el ? (
            <li key={el.id}>
              <div key={el.id + "q"}>Question: {el.question}</div>
              <div key={el.id + "a"}>Answer: {el.answer}</div>
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
        <label htmlFor="f">Upload pdf</label>
        <button type="submit">Submit query</button>
      </form>
    </>
  );
}

export default App;
