import { useState, useEffect } from "react";
import { apiClient } from "./api";
import type { WorldState, CollaborativeTaskResponse, TaskStep } from "./types";
import WorldCanvas from "./components/WorldCanvas";
import ChatPanel from "./components/ChatPanel";
import TaskPublisher from "./components/TaskPublisher";
import CollaborativeResult from "./components/CollaborativeResult";
import "./App.css";

const ROOM_ID = "default";

function App() {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; agent?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collaborativeResult, setCollaborativeResult] = useState<CollaborativeTaskResponse | null>(null);
  const [planningSteps, setPlanningSteps] = useState<TaskStep[] | null>(null);
  const [pendingTaskDescription, setPendingTaskDescription] = useState<string | null>(null);

  // 加载初始状态
  useEffect(() => {
    loadWorldState();
  }, []);

  const loadWorldState = async () => {
    try {
      const state = await apiClient.getWorldState(ROOM_ID);
      setWorldState(state);
    } catch (err) {
      console.error("加载世界状态失败:", err);
      setError("无法连接到后端服务，请确保后端正在运行");
    }
  };

  const handleSendMessage = async (message: string, targetAgent?: string) => {
    if (isLoading) return;

    // 添加用户消息
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setIsLoading(true);
    setError(null);

    try {
      // 发送消息到后端
      const response = await apiClient.sendMessage(ROOM_ID, {
        message,
        target_agent: targetAgent,
      });

      // 添加助手回复
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.output,
          agent: response.agent_used,
        },
      ]);

      // 更新世界状态
      setWorldState(response.world_state);
    } catch (err) {
      console.error("发送消息失败:", err);
      setError("发送消息失败，请检查后端连接");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "抱歉，发生了错误。请稍后重试。",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentClick = (agentId: string) => {
    // 点击智能体时的处理
    console.log("点击了智能体:", agentId);
    // 可以在这里添加选中智能体的逻辑
  };

  const handleClearRoom = async () => {
    if (confirm("确定要清空房间吗？这将清除所有对话历史。")) {
      try {
        await apiClient.clearRoom(ROOM_ID);
        setMessages([]);
        setCollaborativeResult(null);
        await loadWorldState();
      } catch (err) {
        console.error("清空房间失败:", err);
        setError("清空房间失败");
      }
    }
  };

  const handleAnalyzeTask = async (description: string) => {
    try {
      // Add system message to chat
      setMessages((prev) => [
        ...prev,
        { role: "user", content: `请求智能规划任务：${description}` },
        { role: "assistant", content: "正在分析任务需求并拆解步骤..." }
      ]);

      const analysis = await apiClient.analyzeTask(description);
      setPlanningSteps(analysis.steps);
      setPendingTaskDescription(description);
    } catch (err) {
      console.error("任务分析失败:", err);
      alert("任务分析失败，请重试");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "任务分析失败，请稍后重试。" }
      ]);
    }
  };

  const handleAnimationComplete = () => {
    if (planningSteps && pendingTaskDescription) {
      const selectedAgents = planningSteps.map(s => s.agent);
      const agentOrder = planningSteps.map(s => s.agent);
      
      handlePublishCollaborativeTask({
        description: pendingTaskDescription,
        selectedAgents,
        agentOrder
      });
      
      setPlanningSteps(null);
      setPendingTaskDescription(null);
    }
  };

  const handlePublishCollaborativeTask = async (task: {
    description: string;
    selectedAgents: string[];
    agentOrder: string[];
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("发布协作任务:", task);
      const response = await apiClient.publishCollaborativeTask(ROOM_ID, {
        description: task.description,
        selected_agents: task.selectedAgents,
        agent_order: task.agentOrder,
      });
      console.log("协作任务响应:", response);

      setCollaborativeResult(response);
      setWorldState(response.final_world_state);

      // 添加协作任务结果到消息列表
      setMessages((prev) => [
        ...prev,
        { role: "user", content: `发布协作任务：${task.description}` },
        { role: "assistant", content: response.summary, agent: "协作任务" },
      ]);
    } catch (err) {
      console.error("发布协作任务失败:", err);
      setError("发布协作任务失败，请检查后端连接");
    } finally {
      setIsLoading(false);
    }
  };

  if (!worldState) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌟 多智能体协作系统</h1>
        <p>虚拟城市中的六位智能体助手：数学家、艺术家、工程师、商人、运动员、医生</p>
        <div className="header-actions">
          <TaskPublisher
            agents={worldState.agents}
            onPublishTask={handlePublishCollaborativeTask}
            onAnalyzeTask={handleAnalyzeTask}
            isLoading={isLoading}
          />
          <button onClick={handleClearRoom} className="clear-button">
            清空房间
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <main className="app-main">
        <div className="world-section">
          <WorldCanvas
            worldState={worldState}
            onAgentClick={handleAgentClick}
            planningSteps={planningSteps}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>

        <div className="chat-section">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onAnalyzeTask={handleAnalyzeTask}
            isLoading={isLoading}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>基于 openai-agents-python 构建 | 参考小王子童话风格</p>
      </footer>

      {collaborativeResult && (
        <CollaborativeResult
          result={collaborativeResult}
          onClose={() => setCollaborativeResult(null)}
        />
      )}
    </div>
  );
}

export default App;
