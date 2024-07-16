import { Query } from "../../types/DataInterfaces";
const QueriesWidget = ({ queryData }: { queryData: Query[] }) => {
  return (
    <>
      {queryData.length > 0 && (
        <ul className="queries">
          {queryData.map((el) => (
            <li key={el.id}>
              <div>
                {new Date(el.uploadDate).getUTCHours() + 3 < 10
                  ? `0${new Date(el.uploadDate).getUTCHours() + 3}`
                  : new Date(el.uploadDate).getUTCHours() + 3}
                :
                {new Date(el.uploadDate).getUTCMinutes() < 10
                  ? `0${new Date(el.uploadDate).getUTCMinutes()}`
                  : new Date(el.uploadDate).getUTCMinutes()}
              </div>
              <div>Question: {el.question}</div>
              <div>Answer: {el.answer}</div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default QueriesWidget;
