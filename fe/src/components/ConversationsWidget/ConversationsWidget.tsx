import { useEffect, useState } from "react";
import { addPdfEndpoint, conversationsEndpoint } from "../../helpers/endpoints";
import { Conversation, Query, selectConvInterface, User } from "../../types/DataInterfaces";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

const ConversationsWidget = ({
  conversationData,
  setConversationData,
  selectedConversation,
  setSelectedConversation,
  userData,
  queryData,
  setQueryData,
}: {
  conversationData: Conversation[];
  userData: User;
  queryData: Query[];
  setQueryData: (Query: Query[]) => void;
  setConversationData: (Conversation: Conversation[]) => void;
  selectedConversation: selectConvInterface[];
  setSelectedConversation: (conv: selectConvInterface[]) => void;
}) => {
  const [fileField, setFileField] = useState<FileList | null>(null);

  const navigate = useNavigate();
  useEffect(() => {
    const label = document.querySelector("#labelList");
    if (label)
      if (fileField) {
        label.childNodes.forEach((child) => child.remove());
        for (let i = 0; i < fileField.length; i++) {
          var entry = document.createElement("li");
          entry.textContent = `${fileField[i].name}`;
          label.appendChild(entry);
        }
      } else {
        label.childNodes.forEach((child) => child.remove());
        if (fileField) {
        }
      }
  }, [fileField]);

  const postPdf = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await api.post(addPdfEndpoint, formData);
      if (response.status !== 200) {
        throw new Error("Failed to upload PDF");
      }
      if (response.data.status == "error")
        throw new Error(`Failted to upload PDF, ${JSON.stringify(response.data)}`);
      return await response.data.sourceId;
    } catch (error) {
      console.error("Error uploading PDF: ", error);
    }
  };

  const HandleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fileField && fileField.length > 0) {
      try {
        for (var i = 0; i < fileField.length; i++) {
          var response = await postPdf(fileField[i]);
          const sourceId = response;
          const formData = new FormData();
          formData.append("name", fileField[i].name);
          formData.append("pdf", fileField[i]);
          formData.append("sourceId", sourceId);
          formData.append("author", userData.id.toString());
          console.log(formData);
          if (sourceId) {
            try {
              response = await api
                .post(conversationsEndpoint, formData)
                .then((res) => {
                  if (res.status === 200) console.log("Conversation created!");
                })
                .catch((e) => {
                  console.log(e);
                });

              response = await api.get(conversationsEndpoint);
              if (response.status === 200) {
                setConversationData(await response.data);
                resetVisibility();
                document.querySelector("dialog")?.close();
              }
            } catch (error) {
              console.log("Error", error);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
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
  const resetVisibility = () => {
    const list = document.getElementsByClassName("delete-conversation");
    for (let i = 0; i < list.length; i++) {
      const element = list[i] as HTMLElement;
      element.style.display = "none";
    }
  };
  return (
    <div className="conversationWidget">
      <div className="headline">Conversations</div>
      <ul className="conversationsList">
        {conversationData &&
          conversationData.map((el) => (
            <li
              key={el.id}
              id={el.id.toString()}
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
              <div>
                <div>Name:{el.name}</div>
                <div className="pdfDate">
                  UploadDate:
                  {new Date(el.uploadDate).toISOString().split("T")[0]}
                </div>
                {selectedConversation && <a href={`${el.pdf}`}>Download pdf</a>}
              </div>

              <input
                hidden
                type="radio"
                className="delete-conversation"
                id={el.id.toString()}
                onClick={async (e: React.MouseEvent) => {
                  if (e.currentTarget.parentElement) {
                    const id = e.currentTarget.parentElement.id;
                    await api
                      .delete(`${conversationsEndpoint}${id}/`)
                      .catch((e) => {
                        console.log(e);
                      })
                      .then(() => {
                        setConversationData(
                          conversationData.filter((item) => item.id.toString() !== id)
                        );
                        setQueryData(
                          queryData.filter((item) => item.conversation.toString() !== id)
                        );
                        selectedConversation.filter((item) => item.id.toString() == id);
                      });
                  }
                }}
              ></input>
            </li>
          ))}
      </ul>
      <div className="options">
        <dialog>
          <form onSubmit={HandleUpload} className="test">
            <input
              type="file"
              id="f"
              name="f"
              accept=".pdf"
              hidden
              multiple
              title=""
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  for (var i = 0; i < files.length; i++) {
                    if (files[i].type !== "application/pdf") {
                      setFileField(null);
                      alert(`wrong file format at: ${files[i].name}`);
                      return;
                    }
                    if (files[i].size > 32 * 1000 * 1000) {
                      setFileField(null);
                      alert(`File ${files[i].name} is too big(${files[i].size})`);
                      return;
                    }
                    if (files[i].size > 32 * 1000 * 1000) {
                      setFileField(null);
                      alert(`File ${files[i].name} is too big(${files[i].size})`);
                      return;
                    }
                  }
                  setFileField(files);
                } else {
                  alert("You forgot to add any file/files");
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
            <ul id="labelList"></ul>
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
        <div className="settings">
          <button
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
            <button type="button" onClick={toggleVisibility}>
              Delete conversations
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              navigate("/logout");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConversationsWidget;
