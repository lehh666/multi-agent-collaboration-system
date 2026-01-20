/** 类型定义 */

export interface Agent {
  id: string;
  name: string;
  role: "mathematician" | "artist" | "engineer" | "merchant" | "athlete" | "doctor";
  x: number;
  y: number;
  mood: string;
  currentTask: string | null;
  relations: Record<string, any>;
}

export interface Environment {
  timeOfDay: string;
  weather: string;
  rooms: any[];
}

export interface WorldState {
  agents: Agent[];
  environment: Environment;
  lastUpdated?: string;
}

export interface MessageRequest {
  message: string;
  target_agent?: string;
}

export interface MessageResponse {
  output: string;
  world_state: WorldState;
  agent_used?: string;
}

export interface CollaborativeTaskRequest {
  description: string;
  selected_agents: string[];
  agent_order: string[];
}

export interface CollaborativeTaskResponse {
  results: Array<{
    agent_id: string;
    agent_name: string;
    output: string;
    world_state: WorldState;
  }>;
  summary: string;
  final_world_state: WorldState;
}

export interface TaskStep {
  agent: string;
  instruction: string;
  reason: string;
}

export interface TaskAnalysisResponse {
  description: string;
  steps: TaskStep[];
}
