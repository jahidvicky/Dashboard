import { useEffect, useState, useRef } from "react";
import API from "../../API/Api";

const VendorChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const [activeMsgMenu, setActiveMsgMenu] = useState(null);

  const messagesEndRef = useRef(null);


  const ADMIN_ID = "68a6e76c4c3e5ed4fd0df895";
  const token = localStorage.getItem("token");

  // Fetch messages
  useEffect(() => {
    if (!token) {
      setError("No authentication token found.");
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/chat/${ADMIN_ID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching messages:", err?.response?.data || err);
        setError(err?.response?.data?.message || "Error fetching messages");
      }
    };

    fetchMessages();
  }, [token]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await API.post(
        `/send`,
        { receiverId: ADMIN_ID, text: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Error sending message");
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await API.delete(`/message/${msgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
    } catch (err) {
      console.error("Error deleting message:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Error deleting message");
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
      <div className="p-4 bg-white border-b text-xl font-semibold shadow-sm">
        Chat with Admin
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-100 text-red-800 border-b border-red-300">
          {error}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm">No messages yet.</div>
        )}

        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender === ADMIN_ID ? "justify-start" : "justify-end"} relative`}
            onMouseEnter={() => msg.sender !== ADMIN_ID && setActiveMsgMenu(msg._id)}
            onMouseLeave={() => setActiveMsgMenu(null)}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-[70%] relative ${
                msg.sender === ADMIN_ID ? "bg-gray-200 text-gray-800" : "bg-green-500 text-white"
              }`}
            >
              <div>{msg.text}</div>
              <div className="text-xs opacity-70 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* Hover delete button */}
              {activeMsgMenu === msg._id && (
                <div
                  className="absolute top-1 right-1 bg-white border shadow-md px-2 py-1 text-red-500 text-sm rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => handleDeleteMessage(msg._id)}
                >
                  Delete
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t flex items-center">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default VendorChat;
