import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function Chat({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const roomId = "global_chat_room";

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Fetch existing messages from server
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages/${roomId}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();

    // Connect to socket server
    socketRef.current = io(API_URL, {
      transports: ['websocket', 'polling'],
    });

    // Join the chat room
    socketRef.current.emit("join_room", roomId);

    // Listen for incoming messages
    socketRef.current.on("receive_message", (message) => {
      console.log("Received message via socket:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup on unmount
    return () => {
      socketRef.current.off("receive_message");
      socketRef.current.disconnect();
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
    socketRef.current.emit("send_message", messageData);

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>Live Chat</h2>
      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "auto",
          padding: 10,
          marginBottom: 10,
          backgroundColor: "#f0f0f0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg, index) => {
          const isCurrentUser = msg.sender === userId;
          return (
            <div
              key={msg._id || index} // Use message ID for a stable key
              style={{
                alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                backgroundColor: isCurrentUser ? "#dcf8c6" : "#ffffff",
                borderRadius: "7px",
                padding: "8px 12px",
                marginBottom: 8,
                maxWidth: "80%",
                wordWrap: "break-word",
                boxShadow: "0 1px 1px rgba(0, 0, 0, 0.1)",
              }}
            >
              {msg.content}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <input
        type="text"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ width: "80%", padding: 8 }}
      />
      <button onClick={handleSend} style={{ padding: "8px 16px", marginLeft: 8 }}>
        Send
      </button>
    </div>
  );
}
