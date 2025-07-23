import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL || "http://localhost:5001"; // Adjust if needed
const API_SERVER_URL = process.env.REACT_APP_API_SERVER_URL || "http://localhost:5001"; // Adjust if needed

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
        const response = await axios.get(`${API_SERVER_URL}/api/messages/${roomId}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();

    // Connect to socket server
    socketRef.current = io(SOCKET_SERVER_URL, {
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
      <h2>Live Chat - User: {userId}</h2>
      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "auto",
          padding: 10,
          marginBottom: 10,
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: 8 }}>
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
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
