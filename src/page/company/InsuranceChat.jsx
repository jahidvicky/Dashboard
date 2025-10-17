import React, { useState, useEffect, useRef } from "react";
import API from "../../API/Api";
import { useAuth } from "../../authContext/AuthContext";

const InsuranceChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeMsgMenu, setActiveMsgMenu] = useState(null); // hovered message

  const messagesEndRef = useRef(null);
  const ADMIN_ID = "68a6e76c4c3e5ed4fd0df895";
  const token = localStorage.getItem("token");

  // ---------------- Fetch messages ----------------
  const fetchMessages = async () => {
    if (!user?._id) return;
    try {
      const res = await API.get(`/chat/${ADMIN_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  // ---------------- Send message ----------------
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await API.post(
        "/send",
        {
          receiverId: ADMIN_ID,
          text: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err);
    }
  };

  // ---------------- Delete message ----------------
  const handleDeleteMessage = async (msgId) => {
    try {
      await API.delete(`/message/${msgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
    } catch (err) {
      console.error("Error deleting message:", err.response?.data || err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="p-4 border-b bg-white font-bold sticky top-0 z-10">
        Chat with Admin
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 relative">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No messages yet. Start chatting with Admin.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.sender === user._id ? "justify-end" : "justify-start"} relative`}
              onMouseEnter={() => msg.sender === user._id && setActiveMsgMenu(msg._id)}
              onMouseLeave={() => setActiveMsgMenu(null)}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs break-words relative ${msg.sender === user._id ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
              >
                <div>{msg.text}</div>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                {/* Three-dot menu for delete */}
                {activeMsgMenu === msg._id && (
                  <div
                    className="absolute top-1 right-1 bg-white border shadow-md rounded text-sm z-50 cursor-pointer px-2 py-1 text-red-500 hover:bg-gray-100"
                    onClick={() => handleDeleteMessage(msg._id)}
                  >
                    Delete
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white flex sticky bottom-0">
        <input
          type="text"
          className="flex-1 border rounded-l px-4 py-2 focus:outline-none"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 hover:cursor-pointer"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default InsuranceChat;
