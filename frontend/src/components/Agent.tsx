/** 智能体可视化组件 */
import React, { useState, useEffect } from "react";
import type { Agent as AgentType } from "../types";
import "./Agent.css";

interface AgentProps {
  agent: AgentType;
  onClick?: () => void;
}

const Agent: React.FC<AgentProps> = ({ agent, onClick }) => {
  const [animationClass, setAnimationClass] = useState<string>("");

  const animations = ["idle", "wave", "jump", "think", "walk"];

  useEffect(() => {
    const changeAnimation = () => {
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
      setAnimationClass(randomAnimation);
    };

    changeAnimation();
    const interval = setInterval(changeAnimation, 3000);

    return () => clearInterval(interval);
  }, []);

  // Get the appropriate image based on the agent's role
  const getAgentImage = () => {
    switch(agent.role) {
      case "mathematician":
        return "/images/agents/mathematician.svg";
      case "artist":
        return "/images/agents/artist.svg";
      case "engineer":
        return "/images/agents/engineer.svg";
      case "merchant":
        return "/images/agents/merchant.svg";
      case "athlete":
        return "/images/agents/athlete.svg";
      case "doctor":
        return "/images/agents/doctor.svg";
      default:
        return "/images/agents/mathematician.svg"; // Default to mathematician
    }
  };

  const getImageColor = () => {
    if (agent.role === "mathematician") {
      return "#4A90E2";
    } else if (agent.role === "artist") {
      return "#E94B9C";
    } else if (agent.role === "engineer") {
      return "#50C878";
    } else if (agent.role === "merchant") {
      return "#F59E0B";
    } else if (agent.role === "athlete") {
      return "#FF6B6B";
    } else if (agent.role === "doctor") {
      return "#00D4AA";
    } else {
      return "#666666";
    }
  };

  const color = getImageColor();

  return (
    <div
      className={`agent ${animationClass}`}
      style={{
        left: `${agent.x}px`,
        top: `${agent.y}px`,
      }}
      onClick={onClick}
    >
      <img 
        src={getAgentImage()} 
        alt={agent.name} 
        className="agent-image"
        draggable={false}
      />
      <div className="agent-name">{agent.name}</div>
      {agent.currentTask && (
        <div className="agent-task">📋 {agent.currentTask}</div>
      )}
      <div className="agent-pulse" style={{ borderColor: color }}></div>
    </div>
  );
};

export default Agent;
