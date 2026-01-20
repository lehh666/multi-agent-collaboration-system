/** 聊天面板组件 */
import React, { useState, useRef, useEffect } from "react";
import "./ChatPanel.css";

interface ChatPanelProps {
  messages: Array<{ role: "user" | "assistant"; content: string; agent?: string }>;
  onSendMessage: (message: string, targetAgent?: string) => void;
  onAnalyzeTask?: (description: string) => Promise<void>;
  isLoading?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, onAnalyzeTask, isLoading }) => {
  const [input, setInput] = useState("");
  const [targetAgent, setTargetAgent] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim(), targetAgent || undefined);
      setInput("");
    }
  };

  const handleSmartPlan = () => {
    if (input.trim() && !isLoading && onAnalyzeTask) {
      onAnalyzeTask(input.trim());
      setInput("");
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>对话</h3>
        <select
          value={targetAgent}
          onChange={(e) => setTargetAgent(e.target.value)}
          className="agent-select"
        >
          <option value="">自动分配</option>
          <option value="mathematician">指定给数学家</option>
          <option value="artist">指定给艺术家</option>
          <option value="engineer">指定给工程师</option>
          <option value="merchant">指定给商人</option>
          <option value="athlete">指定给运动员</option>
          <option value="doctor">指定给医生</option>
        </select>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-message">
            开始对话吧！向智能体们提出你的问题或需求。
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-role">
              {msg.role === "user" ? "你" : msg.agent || "智能体"}
            </div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-role">思考中...</div>
            <div className="message-content">智能体正在思考...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          className="chat-input"
          disabled={isLoading}
        />
        <div className="chat-actions">
          {onAnalyzeTask && (
            <button 
              type="button" 
              onClick={handleSmartPlan}
              disabled={isLoading || !input.trim()} 
              className="chat-smart-plan"
              title="智能规划并拆解任务"
            >
              🤖 智能规划
            </button>
          )}
          <button type="submit" disabled={isLoading || !input.trim()} className="chat-send">
            发送
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
