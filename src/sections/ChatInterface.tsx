import { useState } from "react";

interface ChatMessage {
  id: string;
  sender: "user" | "provider";
  text: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  serviceName: string;
  providerName: string;
  onBack: () => void;
}

export default function ChatInterface({
  serviceName,
  providerName,
  onBack,
}: ChatInterfaceProps) {
  const initialTimestamp = new Date(new Date().getTime() - 5 * 60000);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "provider",
      text: `Hi! I'm interested in helping you with ${serviceName}. How can I assist you today?`,
      timestamp: initialTimestamp,
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const bgColor = "#0f172a";
  const cardBg = "#1e293b";
  const textColor = "#e2e8f0";
  const mutedColor = "#94a3b8";
  const borderColor = "#334155";

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Simulate provider response after a delay
    setTimeout(() => {
      const providerResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "provider",
        text: "Thanks for your message! I will get back to you shortly with more details.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, providerResponse]);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        background: bgColor,
        color: textColor,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: cardBg,
          borderBottom: `1px solid ${borderColor}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            fontSize: "1.5rem",
            background: "none",
            border: "none",
            color: textColor,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>
            {providerName}
          </h2>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "0.85rem",
              color: mutedColor,
            }}
          >
            {serviceName}
          </p>
        </div>
        <div style={{ fontSize: "1.2rem" }}>●</div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: "flex",
              justifyContent:
                message.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "60%",
                background: message.sender === "user" ? "#0ea5e9" : cardBg,
                color: message.sender === "user" ? "white" : textColor,
                padding: "12px 16px",
                borderRadius: "12px",
                border:
                  message.sender === "provider"
                    ? `1px solid ${borderColor}`
                    : "none",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "0.95rem",
                  lineHeight: "1.5",
                }}
              >
                {message.text}
              </p>
              <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.7 }}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          background: cardBg,
          borderTop: `1px solid ${borderColor}`,
          padding: "16px 24px",
          display: "flex",
          gap: "12px",
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "8px",
            border: `1px solid ${borderColor}`,
            background: bgColor,
            color: textColor,
            outline: "none",
            fontSize: "0.95rem",
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            background: "#0ea5e9",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
