import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket";
import axios from "axios";
import "./Chat.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function Chat({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const roomId = "global_chat_room";

  // New state for draggable position
  // Removed draggable position state and refs as dragging is disabled

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Fetch existing messages from server
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages/${roomId}`);
        // Sort messages by timestamp ascending to ensure continuous flow
        const sortedMessages = response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(sortedMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();

    // Join the chat room
    socket.emit("join_room", roomId);

    // Listen for incoming messages
    socket.on("receive_message", (message) => {
      console.log("Received message via socket:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup on unmount
    return () => {
      socket.off("receive_message");
      // Do not disconnect shared socket instance here
    };
  }, []);

  const handleSend = () => {
    if (input.trim() === "") return;

    const messageData = {
      roomId,
      sender: userId,
      content: input.trim(),
    };

    // Emit message to server
    socket.emit("send_message", messageData);

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Mouse event handlers for dragging
  // Removed dragging handlers as dragging is disabled for centering

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <h2 className="chat-header">Live Chat</h2>
        <div className="messages">
          {messages.map((msg, index) => {
            const isCurrentUser = msg.sender === userId;
            const messageTime = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : "";
            return (
              <div
                key={msg._id || index}
                className={`message ${isCurrentUser ? "current-user" : "other-user"}`}
                style={{ animation: "fadeIn 0.3s ease" }}
              >
                <div className="sender-info">{isCurrentUser ? "You" : (msg.sender || "Unknown")}</div>
                <div>{msg.content}</div>
                {messageTime && <div className="timestamp">{messageTime}</div>}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-container">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSend} disabled={input.trim() === ""}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
