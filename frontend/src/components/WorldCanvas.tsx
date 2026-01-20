/** 世界画布组件 */
import React, { useEffect, useState } from "react";
import type { WorldState, TaskStep } from "../types";
import Agent from "./Agent";
import "./WorldCanvas.css";
import { calculateResponsivePositions } from "../utils/positioning";
import CharacterBubble from "./CharacterBubble";
import { apiClient } from "../api";
import TaskDistributionAnimation from "./TaskDistributionAnimation";

interface WorldCanvasProps {
  worldState: WorldState;
  onAgentClick?: (agentId: string) => void;
  planningSteps?: TaskStep[] | null;
  onAnimationComplete?: () => void;
}

const WorldCanvas: React.FC<WorldCanvasProps> = ({ 
  worldState, 
  onAgentClick, 
  planningSteps, 
  onAnimationComplete 
}) => {
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 700 });
  const [adjustedAgents, setAdjustedAgents] = useState(worldState.agents);
  const [activeBubbleAgentId, setActiveBubbleAgentId] = useState<string | null>(null);

  useEffect(() => {
    const updateCanvasDimensions = () => {
      const canvasElement = document.querySelector('.world-canvas');
      if (canvasElement) {
        const rect = canvasElement.getBoundingClientRect();
        setCanvasDimensions({
          width: rect.width || 800,
          height: rect.height || 700
        });
      }
    };

    // Get initial dimensions
    updateCanvasDimensions();

    // Add resize listener
    window.addEventListener('resize', updateCanvasDimensions);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, []);

  useEffect(() => {
    // Recalculate positions when world state or canvas dimensions change
    const positionedAgents = calculateResponsivePositions(
      worldState.agents,
      canvasDimensions.width,
      canvasDimensions.height
    );
    setAdjustedAgents(positionedAgents);
  }, [worldState.agents, canvasDimensions]);

  const handleAgentClick = (agentId: string) => {
    setActiveBubbleAgentId(agentId === activeBubbleAgentId ? null : agentId);
    onAgentClick?.(agentId);
  };

  const handleBubbleMessage = async (agentId: string, message: string) => {
    // Send message specifically to this agent
    const response = await apiClient.sendMessage("default", {
      message,
      target_agent: agentId
    });
    return response.output;
  };

  const activeAgent = adjustedAgents.find(a => a.id === activeBubbleAgentId);

  return (
    <div className="world-canvas">
      <div className="world-background">
        {/* 天空 */}
        <div className="sky"></div>
        {/* 地面 */}
        <div className="ground"></div>
        
        {/* 渲染智能体 */}
        {adjustedAgents.map((agent) => (
          <Agent
            key={agent.id}
            agent={agent}
            onClick={() => handleAgentClick(agent.id)}
          />
        ))}

        {/* 渲染气泡 */}
        {activeAgent && (
          <CharacterBubble
            agentId={activeAgent.id}
            agentName={activeAgent.name}
            agentRole={activeAgent.role}
            position={{ x: activeAgent.x, y: activeAgent.y }}
            onClose={() => setActiveBubbleAgentId(null)}
            onSendMessage={(msg) => handleBubbleMessage(activeAgent.id, msg)}
          />
        )}

        {/* 任务分配动画 */}
        {planningSteps && onAnimationComplete && (
          <TaskDistributionAnimation
            steps={planningSteps}
            agents={adjustedAgents}
            onComplete={onAnimationComplete}
          />
        )}
      </div>
      
      {/* 环境信息 */}
      <div className="world-info">
        <div className="info-item">
          <span>时间:</span> {worldState.environment.timeOfDay === "day" ? "白天" : "夜晚"}
        </div>
        <div className="info-item">
          <span>天气:</span> {worldState.environment.weather === "sunny" ? "晴天" : worldState.environment.weather}
        </div>
      </div>
    </div>
  );
};

export default WorldCanvas;
