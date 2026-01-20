import React, { useEffect, useState } from "react";
import type { TaskStep } from "../types";
import "./TaskDistributionAnimation.css";

interface TaskDistributionAnimationProps {
  steps: TaskStep[];
  onComplete: () => void;
  agents: Array<{ id: string; x: number; y: number }>;
}

const TaskDistributionAnimation: React.FC<TaskDistributionAnimationProps> = ({ steps, onComplete, agents }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [showTriage, setShowTriage] = useState(false);

  useEffect(() => {
    // Start animation sequence
    const startSequence = async () => {
      // 1. Show Triage Agent
      setShowTriage(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Distribute tasks one by one
      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for particle animation
      }

      // 3. Complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete();
    };

    startSequence();
  }, [steps, onComplete]);

  const getAgentPosition = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? { x: agent.x, y: agent.y } : { x: 0, y: 0 };
  };

  return (
    <div className="task-distribution-overlay">
      {/* Triage Agent (Center) */}
      <div className={`triage-agent ${showTriage ? 'visible' : ''}`}>
        <div className="triage-icon">🤖</div>
        <div className="triage-label">任务分配员</div>
      </div>

      {/* Distribution Particles */}
      {currentStepIndex >= 0 && currentStepIndex < steps.length && (
        <div 
          className="distribution-particle"
          style={{
            '--target-x': `${getAgentPosition(steps[currentStepIndex].agent).x}px`,
            '--target-y': `${getAgentPosition(steps[currentStepIndex].agent).y}px`
          } as React.CSSProperties}
        >
          📋
        </div>
      )}

      {/* Step Info */}
      {currentStepIndex >= 0 && currentStepIndex < steps.length && (
        <div className="step-info-toast">
          <div className="step-title">正在分配任务 {currentStepIndex + 1}/{steps.length}</div>
          <div className="step-content">
            <span className="step-agent">To: {steps[currentStepIndex].agent}</span>
            <span className="step-desc">{steps[currentStepIndex].instruction}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDistributionAnimation;