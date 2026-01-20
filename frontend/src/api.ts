import type { MessageRequest, MessageResponse, WorldState, CollaborativeTaskRequest, CollaborativeTaskResponse, TaskAnalysisResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  async sendMessage(roomId: string, request: MessageRequest): Promise<MessageResponse> {
    const response = await fetch(`${this.baseUrl}/api/rooms/${roomId}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getWorldState(roomId: string): Promise<WorldState> {
    const response = await fetch(`${this.baseUrl}/api/rooms/${roomId}/state`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.world_state;
  }

  async clearRoom(roomId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/rooms/${roomId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async publishCollaborativeTask(roomId: string, request: CollaborativeTaskRequest): Promise<CollaborativeTaskResponse> {
    const response = await fetch(`${this.baseUrl}/api/rooms/${roomId}/collaborative-task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async analyzeTask(description: string): Promise<TaskAnalysisResponse> {
    const response = await fetch(`${this.baseUrl}/api/analyze-task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
