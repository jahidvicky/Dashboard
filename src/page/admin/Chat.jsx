import { useState, useEffect, useRef } from "react";
import API from "../../API/Api";
import { useAuth } from "../../authContext/AuthContext";

const Chat = () => {
  const [vendors, setVendors] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeMsgMenu, setActiveMsgMenu] = useState(null); // hovered message ID

  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token"); // token from localStorage

  // ---------------- Fetch vendors ----------------
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await API.get("/allvendor", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVendors(res.data);
      } catch (err) {
        console.error("Error fetching vendors:", err.response?.data || err);
      }
    };
    fetchVendors();
  }, [token]);

  // ---------------- Fetch insurances ----------------
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await API.get("/getAllCompany", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInsurances(res.data.companies || []);
      } catch (err) {
        console.error("Error fetching companies:", err.response?.data || err);
      }
    };
    fetchCompanies();
  }, [token]);

  // ---------------- Fetch messages ----------------
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/chat/${selectedUser.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err.response?.data || err);
      }
    };

    fetchMessages();
  }, [selectedUser, token]);

  // ---------------- Send message ----------------
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const res = await API.post(
        "/send",
        {
          receiverId: selectedUser.userId,
          text: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      // Remove message locally after successful delete
      setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
    } catch (err) {
      console.error("Error deleting message:", err.response?.data || err);
    }
  };

  // ---------------- Scroll to bottom ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r overflow-y-auto">
        <h2 className="text-xl font-bold p-4 border-b">Vendors</h2>
        {vendors.map((vendor) => (
          <div
            key={vendor._id}
            onClick={() => setSelectedUser(vendor)}
            className={`p-4 cursor-pointer border-b hover:bg-gray-100 ${selectedUser?._id === vendor._id ? "bg-gray-200" : ""
              }`}
          >
            <p className="font-semibold">{vendor.contactName}</p>
            <p className="text-sm text-gray-500">{vendor.contactEmail}</p>
          </div>
        ))}

        <h2 className="text-xl font-bold p-4 border-b">Insurance Companies</h2>
        {insurances.map((ins) => (
          <div
            key={ins._id}
            onClick={() => setSelectedUser(ins)}
            className={`p-4 cursor-pointer border-b hover:bg-gray-100 ${selectedUser?._id === ins._id ? "bg-gray-200" : ""
              }`}
          >
            <p className="font-semibold">{ins.companyName}</p>
            <p className="text-sm text-gray-500">{ins.contactEmail}</p>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="p-4 border-b bg-white font-bold sticky top-0 z-10">
          Chat with{" "}
          {selectedUser?.contactName ||
            selectedUser?.companyName ||
            "Select a User"}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {!selectedUser ? (
            <div className="text-center text-gray-500 mt-10">
              Select a user to start chatting
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.sender === selectedUser.userId
                    ? "justify-start"
                    : "justify-end"
                  } relative`}
                onMouseEnter={() => setActiveMsgMenu(msg._id)}
                onMouseLeave={() => setActiveMsgMenu(null)}
              >
                <div
                  className={`px-4 py-2 rounded-lg max-w-xs break-words relative ${msg.sender === selectedUser.userId
                      ? "bg-gray-200 text-gray-800"
                      : "bg-green-500 text-white"
                    }`}
                >
                  <div>{msg.text}</div>

                  {/* Delete button only for own messages */}
                  {activeMsgMenu === msg._id && msg.sender === user._id && (
                    <div className="absolute top-1 right-1 bg-white border shadow rounded text-xs z-10">
                      <div
                        className="px-2 py-1 cursor-pointer text-red-500 hover:bg-gray-100"
                        onClick={() => handleDeleteMessage(msg._id)}
                      >
                        Delete
                      </div>
                    </div>
                  )}

                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send message box */}
        <div className="p-4 border-t bg-white flex sticky bottom-0">
          <input
            type="text"
            className="flex-1 border rounded-l px-4 py-2 focus:outline-none"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={!selectedUser}
          />
          <button
            className={`px-4 py-2 rounded-r ${selectedUser
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed hover:cursor-pointer"
              }`}
            onClick={handleSend}
            disabled={!selectedUser}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
