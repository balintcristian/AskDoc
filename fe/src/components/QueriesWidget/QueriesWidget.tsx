import { Query } from "../../types/DataInterfaces";
const QueriesWidget = ({
  queryData,
  convId,
}: {
  queryData: Query[];
  convId: number;
}) => {
  return (
    <ul className="queries">
      {queryData
        .filter((query) => query.conversation == convId)
        .map((el) => (
          <li key={el.id}>
            <div>
              Id: {el.id} ConversationID: {el.conversation}
            </div>
            <div>Question: {el.question}</div>
            <div>Answer: {el.answer}</div>
          </li>
        ))}
    </ul>
  );
};

export default QueriesWidget;
