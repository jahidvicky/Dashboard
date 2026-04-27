import { useEffect, useState, useRef } from "react";
import API from "../../API/Api";

const VendorChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const [activeMsgMenu, setActiveMsgMenu] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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
        setError(err?.response?.data?.message || "Error fetching messages");
      }
    };

    fetchMessages();
  }, [token]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto resize textarea
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  };

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

      textareaRef.current.style.height = "auto";
      scrollToBottom();
    } catch (err) {
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
      setError(err?.response?.data?.message || "Error deleting message");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* Header */}
      <div className="p-4 bg-white border-b text-lg font-semibold shadow-sm sticky top-0 z-10">
        Chat with Admin
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-100 text-red-600 text-sm border-b">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm">
            No messages yet
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender === ADMIN_ID ? "justify-start" : "justify-end"
              }`}
            onMouseEnter={() =>
              msg.sender !== ADMIN_ID && setActiveMsgMenu(msg._id)
            }
            onMouseLeave={() => setActiveMsgMenu(null)}
          >
            <div
              className={`relative px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow-sm ${msg.sender === ADMIN_ID
                  ? "bg-gray-200 text-gray-800"
                  : "bg-green-500 text-white"
                }`}
            >
              {msg.text}

              <div className="text-[10px] opacity-70 mt-1 text-right">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* Delete button */}
              {activeMsgMenu === msg._id && (
                <button
                  onClick={() => handleDeleteMessage(msg._id)}
                  className="absolute -top-2 -right-2 bg-white border shadow px-2 py-0.5 text-xs text-red-500 rounded hover:bg-gray-100"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t sticky bottom-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows="1"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 max-h-32 overflow-y-auto"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            onClick={handleSend}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorChat;