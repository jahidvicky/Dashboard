import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { CHAT_API_URL, SOCKET_URL } from "../../API/Api";

let socket = null;

export default function SupportChatAdmin() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState("active");
    const [unread, setUnread] = useState({});        // { chatId: count }
    const [isTyping, setIsTyping] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const chatEndRef = useRef(null);
    const selectedChatRef = useRef(null);            // stable ref for socket handlers

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    const scrollToBottom = () =>
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => scrollToBottom(), [messages]);

    /* ── Load all chats ── */
    useEffect(() => {
        fetch(`${CHAT_API_URL}/support`)
            .then((r) => r.json())
            .then((d) => setChats(d.chats || []));
    }, []);

    /* ── Socket setup ── */
    useEffect(() => {
        if (!socket) {
            socket = io(SOCKET_URL, {
                path: "/socket.io/",
                transports: ["websocket"],
            });
        }

        /* New chat from any user */
        socket.on("newChat", (newChat) => {
            setChats((prev) => {
                if (prev.find((c) => c._id === newChat._id)) return prev;
                return [newChat, ...prev];
            });
        });

        /* Incoming message */
        socket.on("newMessage", (msg) => {
            const current = selectedChatRef.current;

            if (current && msg.chatId === current._id) {
                // Active window — append directly
                setMessages((prev) => [...prev, msg]);
            } else {
                // Background chat — bump unread badge
                setUnread((prev) => ({
                    ...prev,
                    [msg.chatId]: (prev[msg.chatId] || 0) + 1,
                }));
            }

            // Bubble latest message preview to sidebar
            setChats((prev) =>
                prev.map((c) =>
                    c._id === msg.chatId ? { ...c, lastMessage: msg.text } : c
                )
            );
        });

        /* Chat closed by user */
        socket.on("chatClosed", (updatedChat) => {
            setChats((prev) =>
                prev.map((c) => (c._id === updatedChat._id ? updatedChat : c))
            );
            if (selectedChatRef.current?._id === updatedChat._id) {
                setSelectedChat(updatedChat);
            }
        });

        /* Rating submitted */
        socket.on("ratingSubmitted", (updatedChat) => {
            setChats((prev) =>
                prev.map((c) => (c._id === updatedChat._id ? updatedChat : c))
            );
        });

        /* Admin typing indicator (other admins) */
        socket.on("typing", () => {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 2000);
        });

        return () => {
            socket.off("newChat");
            socket.off("newMessage");
            socket.off("chatClosed");
            socket.off("ratingSubmitted");
            socket.off("typing");
        };
    }, []);

    /* ── Open a chat ── */
    const loadChat = async (chat) => {
        setSelectedChat(chat);
        setIsTyping(false);

        // Clear unread badge
        setUnread((prev) => ({ ...prev, [chat._id]: 0 }));

        socket.emit("admin:join", { chatId: chat._id });

        const res = await fetch(`${CHAT_API_URL}/support/${chat._id}`);
        const data = await res.json();
        setMessages(data.chat?.messages || []);
    };

    /* ── Assign chat to admin (stops AI replies) ── */
    const assignChat = async () => {
        if (!selectedChat || assigning) return;
        setAssigning(true);
        try {
            // Get admin ID from localStorage
            const adminData = JSON.parse(localStorage.getItem("user") || "{}");
            const adminId = adminData?._id;

            const res = await fetch(
                `${CHAT_API_URL}/support/${selectedChat._id}/assign`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ adminId: adminId || null }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                console.error("Assign failed:", data);
                alert(data.error || "Failed to assign chat");
                return;
            }

            if (data.chat) {
                setSelectedChat(data.chat);
                setChats((prev) =>
                    prev.map((c) => (c._id === data.chat._id ? data.chat : c))
                );
            }
        } catch (e) {
            console.error("Assign error:", e);
            alert("Network error while assigning chat");
        } finally {
            setAssigning(false);
        }
    };

    /* ── Send message ── */
    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedChat || selectedChat.status === "closed") return;

        socket.emit("admin:sendMessage", {
            chatId: selectedChat._id,
            text: input.trim(),
            sender: "admin",
        });

        setInput("");
    };

    /* ── Typing indicator emit ── */
    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (selectedChat) {
            socket.emit("admin:typing", { chatId: selectedChat._id });
        }
    };

    /* ── Close chat from admin side ── */
    const closeChat = async () => {
        if (!selectedChat) return;
        await fetch(`${CHAT_API_URL}/support/${selectedChat._id}/close`, {
            method: "PATCH",
        });
    };

    /* ── Helpers ── */
    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const senderLabel = (sender) => {
        if (sender === "admin") return "Admin";
        if (sender === "ai") return "AI Assistant";
        if (sender === "user") return "User";
        return "";
    };

    const filteredChats = chats.filter((c) =>
        activeTab === "active" ? c.status !== "closed" : c.status === "closed"
    );

    const visibleMessages = messages.filter(
        (m) =>
            m.sender !== "system" &&
            !(
                m.sender === "ai" &&
                m.text.startsWith("Hello! It seems like we just started")
            )
    );

    /* ── Render ── */
    return (
        <div className="flex h-[85vh] border rounded-xl bg-white shadow-lg overflow-hidden">

            {/* ── Sidebar ── */}
            <div className="w-1/3 border-r flex flex-col bg-gray-50">

                {/* Tabs */}
                <div className="flex gap-2 p-3 border-b">
                    {["active", "closed"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${activeTab === tab
                                ? "bg-red-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            {tab === "active" ? "Active" : "Closed"}
                            {tab === "active" && (
                                <span className="ml-1 text-xs">
                                    ({chats.filter((c) => c.status !== "closed").length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Chat list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredChats.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center mt-6">No chats found</p>
                    ) : (
                        filteredChats.map((chat) => {
                            const isSelected = selectedChat?._id === chat._id;
                            const badge = unread[chat._id] || 0;

                            return (
                                <div
                                    key={chat._id}
                                    onClick={() => loadChat(chat)}
                                    className={`p-3 rounded-lg cursor-pointer transition ${isSelected
                                        ? "bg-red-500 text-white"
                                        : "bg-white hover:bg-gray-100 border border-gray-100"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-sm truncate">{chat.name}</p>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {badge > 0 && (
                                                <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                                    {badge}
                                                </span>
                                            )}
                                            <span
                                                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${chat.status === "closed"
                                                    ? isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                                                    : isSelected ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {chat.status}
                                            </span>
                                        </div>
                                    </div>

                                    <p className={`text-xs mt-0.5 truncate ${isSelected ? "text-red-100" : "text-gray-500"}`}>
                                        {chat.email}
                                    </p>
                                    <p className={`text-xs truncate ${isSelected ? "text-red-100" : "text-gray-400"}`}>
                                        {chat.reason}
                                    </p>

                                    {chat.lastMessage && (
                                        <p className={`text-xs mt-1 truncate italic ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                                            {chat.lastMessage}
                                        </p>
                                    )}

                                    {chat.rating && (
                                        <p className={`text-xs mt-1 font-semibold ${isSelected ? "text-yellow-200" : "text-yellow-500"}`}>
                                            {"★".repeat(chat.rating)}{"☆".repeat(5 - chat.rating)}
                                        </p>
                                    )}

                                    {chat.isAssigned && (
                                        <p className={`text-xs mt-0.5 ${isSelected ? "text-white/70" : "text-blue-500"}`}>
                                            Admin assigned
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Chat Window ── */}
            <div className="flex-1 flex flex-col">

                {/* Header */}
                <div className="p-3 border-b flex items-center justify-between bg-white">
                    <div>
                        {selectedChat ? (
                            <>
                                <p className="font-semibold text-gray-800">{selectedChat.name}</p>
                                <p className="text-xs text-gray-400">{selectedChat.email} · {selectedChat.reason}</p>
                            </>
                        ) : (
                            <p className="text-gray-700 text-sm">Select a chat to begin</p>
                        )}
                    </div>

                    {selectedChat && selectedChat.status !== "closed" && (
                        <div className="flex gap-2">
                            {!selectedChat.isAssigned && (
                                <button
                                    onClick={assignChat}
                                    disabled={assigning}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition"
                                >
                                    {assigning ? "Assigning..." : "Assign to Me"}
                                </button>
                            )}
                            <button
                                onClick={closeChat}
                                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg transition"
                            >
                                Close Chat
                            </button>
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    {visibleMessages.length === 0 && selectedChat && (
                        <p className="text-center text-gray-400 text-sm mt-8">No messages yet</p>
                    )}
                    {!selectedChat && (
                        <p className="text-center text-gray-500 text-sm mt-16">Select a chat from the sidebar</p>
                    )}

                    {visibleMessages.map((m, i) => {
                        const isAdmin = m.sender === "admin";
                        const isAI = m.sender === "ai";
                        const isUser = m.sender === "user";

                        return (
                            <div
                                key={i}
                                className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                            >
                                {/* Sender label */}
                                <span className="text-[10px] text-gray-400 mb-0.5 px-1">
                                    {senderLabel(m.sender)}
                                </span>

                                <div
                                    className={`px-4 py-2 rounded-2xl max-w-[72%] text-sm leading-relaxed ${isAdmin
                                        ? "bg-blue-600 text-white rounded-br-sm"
                                        : isAI
                                            ? "bg-white text-gray-700 border border-gray-200 rounded-bl-sm"
                                            : "bg-red-600 text-white rounded-bl-sm"
                                        }`}
                                >
                                    {m.text}
                                </div>

                                {/* Timestamp */}
                                <span className="text-[10px] text-gray-300 mt-0.5 px-1">
                                    {formatTime(m.createdAt)}
                                </span>
                            </div>
                        );
                    })}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="flex items-start">
                            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-400 flex gap-1 items-center">
                                <span className="animate-bounce">●</span>
                                <span className="animate-bounce delay-75">●</span>
                                <span className="animate-bounce delay-150">●</span>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                {selectedChat && (
                    <form onSubmit={sendMessage} className="p-3 border-t flex gap-2 bg-white">
                        <input
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100"
                            placeholder={
                                selectedChat.status === "closed"
                                    ? "This chat is closed"
                                    : "Type a reply..."
                            }
                            value={input}
                            onChange={handleInputChange}
                            disabled={selectedChat.status === "closed"}
                        />
                        <button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 text-white px-5 rounded-lg text-sm font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                            disabled={selectedChat.status === "closed" || !input.trim()}
                        >
                            Send
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}