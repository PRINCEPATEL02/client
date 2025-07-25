import React from "react";
import Chat from "./Chat";

export default function App() {
  // Directly render Chat component without login
  // Passing a more specific userId
  const defaultUserId = "guest123";

  return <Chat userId={defaultUserId} />;
}
