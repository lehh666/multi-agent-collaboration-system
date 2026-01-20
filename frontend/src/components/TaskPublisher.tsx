/** 任务发布组件 */
import React, { useState } from "react";
import "./TaskPublisher.css";

interface AgentOption {
  id: string;
  name: string;
  role: string;
}

interface TaskPublisherProps {
  agents: AgentOption[];
  onPublishTask: (task: {
    description: string;
    selectedAgents: string[];
    agentOrder: string[];
  }) => void;
  onAnalyzeTask?: (description: string) => Promise<void>;
  isLoading?: boolean;
}

const TaskPublisher: React.FC<TaskPublisherProps> = ({ agents, onPublishTask, onAnalyzeTask, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [agentOrder, setAgentOrder] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleToggleAgent = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter(id => id !== agentId));
      setAgentOrder(agentOrder.filter(id => id !== agentId));
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
      setAgentOrder([...agentOrder, agentId]);
    }
  };

  const handleMoveAgent = (agentId: string, direction: "up" | "down") => {
    const currentIndex = agentOrder.indexOf(agentId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= agentOrder.length) return;

    const newOrder = [...agentOrder];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    setAgentOrder(newOrder);
  };

  const handleAnalyze = async () => {
    if (!description.trim()) {
      alert("请输入任务描述");
      return;
    }
    if (!onAnalyzeTask) return;

    setIsAnalyzing(true);
    try {
      await onAnalyzeTask(description.trim());
      setIsOpen(false);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("任务分析失败，请重试");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = () => {
    if (!description.trim()) {
      alert("请输入任务描述");
      return;
    }
    if (selectedAgents.length === 0) {
      alert("请至少选择一个智能体");
      return;
    }

    onPublishTask({
      description: description.trim(),
      selectedAgents,
      agentOrder
    });

    setDescription("");
    setSelectedAgents([]);
    setAgentOrder([]);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        className="task-publisher-button" 
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
      >
        📋 发布协作任务
      </button>
    );
  }

  return (
    <div className="task-publisher-overlay">
      <div className="task-publisher-modal">
        <div className="task-publisher-header">
          <h2>发布协作任务</h2>
          <button 
            className="close-button" 
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="task-publisher-body">
          <div className="form-group">
            <label>任务描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述你的需求，智能体将按顺序协作完成..."
              className="task-description"
              rows={4}
            />
            {onAnalyzeTask && (
              <button 
                className="analyze-button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !description.trim()}
              >
                {isAnalyzing ? "分析中..." : "🤖 智能规划 & 执行"}
              </button>
            )}
          </div>

          <div className="form-group">
            <label>选择智能体</label>
            <div className="agent-selection">
              {agents.map(agent => (
                <div 
                  key={agent.id}
                  className={`agent-checkbox ${selectedAgents.includes(agent.id) ? 'selected' : ''}`}
                  onClick={() => handleToggleAgent(agent.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedAgents.includes(agent.id)}
                    readOnly
                  />
                  <span className="agent-name">{agent.name}</span>
                  <span className="agent-role">({agent.role})</span>
                </div>
              ))}
            </div>
          </div>

          {selectedAgents.length > 1 && (
            <div className="form-group">
              <label>处理顺序（可拖拽或使用箭头调整）</label>
              <div className="agent-order">
                {agentOrder.map((agentId, index) => {
                  const agent = agents.find(a => a.id === agentId);
                  if (!agent) return null;

                  return (
                    <div key={agentId} className="agent-order-item">
                      <div className="order-controls">
                        <button
                          onClick={() => handleMoveAgent(agentId, "up")}
                          disabled={index === 0}
                          className="order-button"
                        >
                          ↑
                        </button>
                        <span className="order-number">{index + 1}</span>
                        <button
                          onClick={() => handleMoveAgent(agentId, "down")}
                          disabled={index === agentOrder.length - 1}
                          className="order-button"
                        >
                          ↓
                        </button>
                      </div>
                      <div className="agent-info">
                        <span className="agent-name">{agent.name}</span>
                        <span className="agent-role">{agent.role}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="task-summary">
            <p>已选择 {selectedAgents.length} 个智能体</p>
            {agentOrder.length > 0 && (
              <p>执行顺序：{agentOrder.map(id => agents.find(a => a.id === id)?.name).join(" → ")}</p>
            )}
          </div>
        </div>

        <div className="task-publisher-footer">
          <button 
            className="cancel-button" 
            onClick={() => setIsOpen(false)}
          >
            取消
          </button>
          <button 
            className="publish-button" 
            onClick={handlePublish}
            disabled={isLoading || !description.trim() || selectedAgents.length === 0}
          >
            发布任务
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskPublisher;
