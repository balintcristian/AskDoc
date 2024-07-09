import { useEffect, useState } from "react";
import { addPdfEndpoint, conversationsEndpoint } from "../../helpers/endpoints";
import { Conversation, selectConvInterface } from "../../types/DataInterfaces";

const ConversationsWidget = ({
  conversationData,
  setConversationData,
  selectedConversation,
  setSelectedConversation,
}: {
  conversationData: Conversation[];
  setConversationData: (Conversation: Conversation[]) => void;
  selectedConversation: selectConvInterface[];
  setSelectedConversation: (conv: selectConvInterface[]) => void;
}) => {
  const [fileField, setFileField] = useState<File | null>(null);
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    const label = document.querySelector("#fl");
    if (fileField) {
      if (label) label.textContent = fileField.name;
    } else if (label) label.textContent = "";
  }, [fileField]);
  const fetchData = async () => {
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
      return await response.json();
    } catch (error) {
      console.error("Error uploading PDF: ", error);
    }
  };
  const HandleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fileField) {
      try {
        var response = await postPdf(fileField);
        const sourceId = response["sourceId"];
        const formData = new FormData();
        formData.append("name", fileField.name);
        formData.append("pdf", fileField);
        formData.append("sourceId", sourceId);
        if (sourceId)
          try {
            response = await fetch(conversationsEndpoint, {
              method: "POST",
              body: formData,
            });
            if (response.ok) {
              response = await fetch(conversationsEndpoint, {
                method: "GET",
              });
              setConversationData(await response.json());
              document.querySelector("dialog")?.close();
            }
          } catch (error) {
            console.log("Error uploading PDF: ", error);
          }
      } catch (error) {
        console.error(error);
      }
    } else alert("upload file");
  };
  const toggleVisibility = () => {
    const list = document.getElementsByClassName("delete-conversation");
    for (let i = 0; i < list.length; i++) {
      const element = list[i] as HTMLElement;
      if (element.style.display === "" || element.style.display === "none") {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
  };
  return (
    <div className="conversationWidget">
      <div className="headline">Conversations</div>
      <ul className="conversationsList">
        {conversationData &&
          conversationData.map((el) => (
            <li key={el.id} id={el.id.toString()}>
              <div
                className="unSelected"
                onClick={(e: React.MouseEvent) => {
                  if (!selectedConversation) {
                    setSelectedConversation([{ id: el.id, sourceId: el.sourceId }]);
                    e.currentTarget.className = "Selected";
                  }
                  if (e.currentTarget.className == "unSelected") {
                    const updatedData: selectConvInterface[] = [
                      ...selectedConversation,
                      { id: el.id, sourceId: el.sourceId },
                    ];
                    setSelectedConversation(updatedData);
                    e.currentTarget.className = "Selected";
                  } else {
                    const updatedData: selectConvInterface[] = selectedConversation.filter(
                      (item) => item.sourceId !== el.sourceId
                    );
                    setSelectedConversation(updatedData);
                    e.currentTarget.className = "unSelected";
                  }
                }}
              >
                <div>Name:{el.name}</div>
                <div className="pdfDate">
                  UploadDate:
                  {new Date(el.uploadDate).toISOString().split("T")[0]}
                </div>
              </div>
              <link href={el.pdf.name}></link>
              <input
                hidden
                type="checkbox"
                className="delete-conversation"
                onClick={async (e: React.MouseEvent) => {
                  console.log(`${conversationsEndpoint}${e.currentTarget.parentElement?.id}/`);
                  if (e.currentTarget.parentElement)
                    try {
                      await fetch(
                        `${conversationsEndpoint}${e.currentTarget.parentElement.id}/`,
                        {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      );
                    } catch (error) {
                      console.log(error);
                    } finally {
                      setConversationData(
                        conversationData.filter((item) => {
                          item.id != el.id;
                        })
                      );
                    }
                }}
              ></input>
            </li>
          ))}
      </ul>
      <div className="createConversation">
        <dialog>
          <form onSubmit={HandleUpload} className="test">
            <input
              type="file"
              id="f"
              name="f"
              accept=".pdf"
              hidden
              title=""
              onChange={(e) => {
                const files = e.target.files;
                if (files && files[0]) {
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
            <button
              type="button"
              className="dialogButton"
              onClick={() => {
                document.getElementById("f")?.click();
              }}
            >
              Select PDF...
            </button>
            <label htmlFor="f" id="fl"></label>
            <br></br>
            <br></br>
            <button type="submit">Upload pdf</button>
            <button
              type="button"
              onClick={() => {
                const dialog = document.querySelector("dialog");
                const inputField = document.querySelector("#f") as HTMLInputElement;
                if (dialog && inputField) {
                  dialog.close();
                  inputField.value = "";
                  setFileField(null);
                }
              }}
            >
              Cancel
            </button>
          </form>
        </dialog>
        <button
          className="createConversationButton"
          onClick={() => {
            const dialog = document.querySelector("dialog");
            if (!dialog?.open) {
              setFileField(null);
              dialog?.showModal();
            }
          }}
        >
          Create Conversation
        </button>
        {conversationData.length > 0 && (
          <div>
            <input type="checkbox" id="checkbox" onClick={toggleVisibility}></input>
            <label htmlFor="checkbox"> Delete conversations</label>
          </div>
        )}
      </div>
    </div>
  );
};
export default ConversationsWidget;
