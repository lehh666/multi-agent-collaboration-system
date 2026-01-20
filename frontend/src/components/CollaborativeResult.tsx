/** 协作任务结果显示组件 */
import React from "react";
import type { CollaborativeTaskResponse } from "../types";
import "./CollaborativeResult.css";

interface CollaborativeResultProps {
  result: CollaborativeTaskResponse;
  onClose: () => void;
}

const CollaborativeResult: React.FC<CollaborativeResultProps> = ({ result, onClose }) => {
  return (
    <div className="collaborative-result-overlay">
      <div className="collaborative-result-modal">
        <div className="result-header">
          <h2>🎯 协作任务完成</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="result-body">
          <div className="result-summary">
            <h3>任务汇总</h3>
            <div 
              className="summary-content"
              dangerouslySetInnerHTML={{ __html: result.summary }}
            />
          </div>

          {result.results.length > 0 && (
            <div className="result-details">
              <h3>详细结果</h3>
              {result.results.map((item, index) => (
                <div key={index} className="result-item">
                  <div className="result-item-header">
                    <span className="agent-badge">{item.agent_name}</span>
                    <span className="agent-id">ID: {item.agent_id}</span>
                  </div>
                  <div className="result-item-content">
                    {item.output}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="result-footer">
          <button className="close-result-button" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeResult;
