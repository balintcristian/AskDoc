import { useState, useEffect } from "react";
import "./App.css";
interface Query {
  id: number;
  question: string;
  answer: string;
}
const endpoint = `${import.meta.env.VITE_API_URL}queries/`;
function App() {
  const [data, setData] = useState<Query[]>([]);
  const [questionField, setQuestionField] = useState("");
  const [answerField, setAnswerField] = useState("");
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
  const postData = async (question: string, answer: string) => {
    const query = { question: question, answer: answer };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query), // body data type must match "Content-Type" header
    });
    console.log(response.json());
    return response.json();
  };
  const handleSendData = async () => {
    try {
      const newData = await postData(questionField, answerField);
      if (newData) {
        setData((prevstate) => [...prevstate, newData]);
      }

      setQuestionField("");
      setAnswerField("");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <form>
        <label htmlFor="q">Question:</label>
        <br></br>
        <input
          type="text"
          id="q"
          name="q"
          onChange={(e) => {
            setQuestionField(e.target.value ? e.target.value : "");
          }}
        ></input>
        <br></br>
        <label htmlFor="a">Answer:</label> <br></br>
        <input
          type="text"
          id="a"
          name="a"
          onChange={(e) => {
            setAnswerField(e.target.value ? e.target.value : "");
          }}
        ></input>
        <br></br>
        <button type="submit" onClick={handleSendData}>
          Submit query
        </button>
      </form>
    </>
  );
}

export default App;
