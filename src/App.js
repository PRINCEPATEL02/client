import React, { useState } from "react";
import LoginPage from "./LoginPage";
import Chat from "./Chat";

export default function App() {
  const [userId, setUserId] = useState(null);

  const handleLogin = (loggedInUserId) => {
    setUserId(loggedInUserId);
  };

  if (!userId) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Chat userId={userId} />;
}
