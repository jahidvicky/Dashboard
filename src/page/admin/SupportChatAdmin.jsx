import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { CHAT_API_URL, SOCKET_URL } from "../../API/Api";

let socket = null;

export default function SupportChatAdmin() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState("active");

    const chatEndRef = useRef(null);
    const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(() => scrollToBottom(), [messages]);

    // Load all chats initially
    useEffect(() => {
        fetch(`${CHAT_API_URL}/support`)
            .then(res => res.json())
            .then(data => setChats(data.chats));
    }, []);

    // Initialize Socket
    useEffect(() => {
        if (!socket) {
            socket = io(SOCKET_URL, {
                path: "/socket.io/",
                transports: ["websocket"],
            });
        }

        socket.on("newChat", newChat => {
            setChats(prev => [...prev, newChat]);
        });

        return () => {
            socket.off("newChat");
        };
    }, []);

    // Listen for messages on selected chat
    useEffect(() => {
        if (!selectedChat) return;

        socket.emit("admin:join", { chatId: selectedChat._id });

        const messageHandler = (msg) => {
            if (msg.chatId !== selectedChat._id) return;
            console.log("SOCKET RECEIVED:", msg);
            setMessages(prev => [...prev, msg]);
        };

        socket.on("newMessage", messageHandler);

        return () => {
            socket.off("newMessage", messageHandler);
        };
    }, [selectedChat]);

    const loadChat = async (chat) => {
        setSelectedChat(chat);

        const res = await fetch(`${CHAT_API_URL}/support/${chat._id}`);
        const data = await res.json();
        setMessages(data.chat.messages || []);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedChat || selectedChat.status === "closed") return;

        socket.emit("admin:sendMessage", {
            chatId: selectedChat._id,
            text: input.trim(),
            sender: "admin"
        });

        setInput("");
    };

    const filteredChats = chats.filter(chat =>
        activeTab === "active"
            ? chat.status !== "closed"
            : chat.status === "closed"
    );

    return (
        <div className="flex h-[85vh] border rounded-xl bg-white shadow-lg">

            {/* Sidebar */}
            <div className="w-1/3 border-r p-3 overflow-y-auto bg-gray-50">

                {/* Tabs */}
                <div className="flex gap-2 mb-3">
                    <button
                        className={`flex-1 py-2 rounded-md text-sm font-semibold 
                        ${activeTab === "active" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}
                        onClick={() => setActiveTab("active")}
                    >
                        Active Chats
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md text-sm font-semibold 
                        ${activeTab === "closed" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}
                        onClick={() => setActiveTab("closed")}
                    >
                        Closed Chats
                    </button>
                </div>

                {/* Chat List */}
                {filteredChats.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center mt-4">No chats found</p>
                ) : (
                    filteredChats.map(chat => (
                        <div
                            key={chat._id}
                            onClick={() => loadChat(chat)}
                            className={`p-3 rounded-lg cursor-pointer mb-2 transition 
                            ${selectedChat?._id === chat._id
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-100 hover:bg-gray-200"}`}
                        >
                            <p className="font-medium">{chat.name}</p>

                            <p className="text-xs">{chat.email}</p>

                            <p className="text-xs">Reason: {chat.reason}</p>

                            {chat.rating ? (
                                <p className="text-xs text-yellow-500 font-semibold">
                                    Rating: {chat.rating}/5
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400 italic">
                                    No Rating
                                </p>
                            )}

                            <p className="text-xs mt-1 font-semibold">Status: {chat.status}</p>

                        </div>
                    ))
                )}
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
                <div className="p-3 border-b font-semibold text-gray-700">
                    {selectedChat ? selectedChat.name : "Select a chat"}
                </div>

                {/* Messages */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm bg-gray-100">
                    {messages
                        .filter(m =>
                            m.sender !== "system" &&
                            !(m.sender === "ai" && m.text.startsWith("Hello! It seems like we just started"))
                        )
                        .map((m, i) => (
                            <div
                                key={i}
                                className={`px-3 py-2 rounded-xl max-w-[75%] ${m.sender === "admin"
                                    ? "bg-blue-600 text-white ml-auto"
                                    : m.sender === "ai"
                                        ? "bg-gray-200 text-black"
                                        : m.sender === "system"
                                            ? "bg-yellow-200 text-gray-900 text-center mx-auto text-xs"
                                            : "bg-red-600 text-white"
                                    }`}
                            >
                                {m.text}
                            </div>
                        ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Section */}
                {selectedChat && (
                    <form onSubmit={sendMessage} className="p-3 border-t flex gap-2 bg-white">
                        <input
                            className="flex-1 border rounded px-3 py-2 text-sm"
                            placeholder={
                                selectedChat.status === "closed"
                                    ? "Chat is closed"
                                    : "Reply to user..."
                            }
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={selectedChat.status === "closed"}
                        />
                        <button
                            className="bg-red-600 text-white px-4 rounded disabled:bg-gray-400"
                            disabled={selectedChat.status === "closed"}
                        >
                            Send
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
