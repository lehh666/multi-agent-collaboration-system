import React, { useState, useEffect, useRef } from "react";
import "./CharacterBubble.css";

interface CharacterBubbleProps {
  agentId: string;
  agentName: string;
  agentRole: string;
  position: { x: number; y: number };
  onClose: () => void;
  onSendMessage: (message: string) => Promise<string>;
}

const CharacterBubble: React.FC<CharacterBubbleProps> = ({ 
  agentId, 
  agentName, 
  agentRole, 
  position, 
  onClose, 
  onSendMessage 
}) => {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    const getGreeting = () => {
      switch (agentRole) {
        case "mathematician": return "你好！我是数学家。有什么逻辑难题需要我解决吗？";
        case "artist": return "嗨！我是艺术家。让我们一起创造美吧！";
        case "engineer": return "你好，我是工程师。有什么技术问题需要帮忙？";
        case "merchant": return "您好！我是商人。让我们谈谈投资和回报。";
        case "athlete": return "嘿！我是运动员。动起来，保持健康！";
        case "doctor": return "您好，我是医生。您的健康是我最关心的。";
        default: return `你好！我是${agentName}。`;
      }
    };
    setMessages([{ role: "assistant", content: getGreeting() }]);
  }, [agentRole, agentName]);

  // Check position and adjust placement
  useEffect(() => {
    // If agent is in the top 40% of the canvas, show bubble below
    // Assuming canvas height is around 700px
    if (position.y < 350) {
      setPlacement("bottom");
    } else {
      setPlacement("top");
    }
  }, [position.y]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await onSendMessage(userMessage);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "抱歉，我暂时无法回答。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Calculate style based on placement
  const bubbleStyle: React.CSSProperties = {
    left: position.x,
    top: placement === "top" ? position.y - 70 : position.y + 70,
    transform: placement === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
  };

  return (
    <div 
      ref={bubbleRef}
      className={`character-bubble ${placement}`}
      style={bubbleStyle}
    >
      <div className="bubble-header">
        <span className="bubble-title">{agentName}</span>
        <button className="bubble-close" onClick={onClose}>×</button>
      </div>
      
      <div className="bubble-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`bubble-message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && <div className="bubble-message assistant typing">...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="bubble-input-area">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="发送消息..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
          ➤
        </button>
      </div>
      
      <div className="bubble-arrow"></div>
    </div>
  );
};

export default CharacterBubble;