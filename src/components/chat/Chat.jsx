import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";

import { db } from "../../lib/firebase.js";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

const Chat = () => {
  const [chat, setChat] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState("" ); // Correction pour éviter l'erreur d'accès à img.file

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  
  const endRef = useRef(null);

  useEffect(() => {
    if (!chatId) return; // Vérification pour éviter une erreur si chatId est null

    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => unSub();
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    let imgUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img.file); // upload() doit être défini ailleurs
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, 
              { chats: userChatsData.chats });
          }
        }
      });
     } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setImg({ file: null, url: "" });
      setText("");
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <div className="texts">
            <span>{user?.username}</span>
            <p>Online</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="Call" />
          <img src="./video.png" alt="Video Call" />
          <img src="./info.png" alt="Info" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message) => (
          <div
           className={
              message.senderId === currentUser?.id ? "message own" : "message"
           }
               key={message?.createdAt} // Correction de la clé
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="Attachment" />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}

        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="Preview" />
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="Upload" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} />
          <img src="./camera.png" alt="Camera" />
          <img src="./mic.png" alt="Microphone" />
        </div>

        <input
          type="text"
          placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You cannot send a message" : "Type a message..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />

        <div className="emoji">
          <img src="./emoji.png" alt="Emoji" onClick={() => setOpen((prev) => !prev)} />
          {open && <EmojiPicker onEmojiClick={handleEmoji} />}
        </div>

        <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
