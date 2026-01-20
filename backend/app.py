"""FastAPI 应用主文件"""
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
from agents import Runner

# 导入本地模块
import sys
from pathlib import Path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from agent_systems import create_agent_system
from agent_systems.planner import plan_task
from sessions import get_session
from state_store import get_state_store

# 加载环境变量
load_dotenv()

# 设置 OpenAI API Key
from agents import set_default_openai_key
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    set_default_openai_key(api_key)
    print("[OK] OpenAI API Key 已设置")
else:
    print("[WARNING] 未找到 OPENAI_API_KEY 环境变量")

# 创建 FastAPI 应用
app = FastAPI(title="多智能体协作系统", version="1.0.0")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 获取状态存储
state_store = get_state_store()

# 请求模型
class MessageRequest(BaseModel):
    message: str
    target_agent: Optional[str] = None  # mathematician/artist/engineer，None 表示自动分配

class MessageResponse(BaseModel):
    output: str
    world_state: Dict[str, Any]
    agent_used: Optional[str] = None

class WorldStateResponse(BaseModel):
    world_state: Dict[str, Any]

class CollaborativeTaskRequest(BaseModel):
    description: str
    selected_agents: List[str]
    agent_order: List[str]

class CollaborativeTaskResponse(BaseModel):
    results: List[Dict[str, Any]]
    summary: str
    final_world_state: Dict[str, Any]

class TaskAnalysisRequest(BaseModel):
    description: str

class TaskStep(BaseModel):
    agent: str
    instruction: str
    reason: str

class TaskAnalysisResponse(BaseModel):
    description: str
    steps: List[TaskStep]

# WebSocket 连接管理器
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "多智能体协作系统 API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "message": "/api/rooms/{room_id}/message",
            "state": "/api/rooms/{room_id}/state",
            "collaborative-task": "/api/rooms/{room_id}/collaborative-task",
            "clear": "/api/rooms/{room_id}",
            "websocket": "/ws/rooms/{room_id}"
        }
    }

@app.get("/api/health")
async def health():
    """健康检查"""
    return {"status": "ok", "message": "服务运行正常"}

@app.post("/api/rooms/{room_id}/message", response_model=MessageResponse)
async def send_message(room_id: str, request: MessageRequest):
    """发送消息给智能体系统
    
    Args:
        room_id: 房间ID
        request: 消息请求，包含用户消息和可选的指定智能体
    """
    try:
        # 获取会话
        session = get_session(room_id)
        
        # 创建智能体系统
        triage_agent = create_agent_system()
        
        # 如果指定了目标智能体，直接使用该智能体
        agent_to_use = triage_agent
        agent_name = None
        
        if request.target_agent:
            # 获取指定的智能体
            for handoff in triage_agent.handoffs:
                if handoff.name == request.target_agent or \
                   (request.target_agent == "mathematician" and "数学" in handoff.name) or \
                   (request.target_agent == "artist" and "艺术" in handoff.name) or \
                   (request.target_agent == "engineer" and "工程" in handoff.name):
                    agent_to_use = handoff
                    agent_name = handoff.name
                    break
        
        # 构建用户消息
        user_input = request.message
        if request.target_agent:
            user_input = f"[指定给{agent_name}] {request.message}"
        
        # 运行智能体
        result = await Runner.run(agent_to_use, user_input, session=session)
        
        # 获取最新世界状态
        world_state = state_store.get_world(room_id)
        
        return MessageResponse(
            output=result.final_output,
            world_state=world_state,
            agent_used=agent_name or "任务分配员"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理消息时出错: {str(e)}")

@app.get("/api/rooms/{room_id}/state", response_model=WorldStateResponse)
async def get_world_state(room_id: str):
    """获取指定房间的世界状态"""
    try:
        world_state = state_store.get_world(room_id)
        return WorldStateResponse(world_state=world_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取状态时出错: {str(e)}")

@app.delete("/api/rooms/{room_id}")
async def clear_room(room_id: str):
    """清空指定房间的会话和状态"""
    try:
        from sessions import clear_session
        clear_session(room_id)
        state_store.clear_room(room_id)
        return {"message": f"房间 {room_id} 已清空"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"清空房间时出错: {str(e)}")

@app.post("/api/rooms/{room_id}/collaborative-task", response_model=CollaborativeTaskResponse)
async def publish_collaborative_task(room_id: str, request: CollaborativeTaskRequest):
    """发布协作任务，智能体按顺序执行并汇总结果
    
    Args:
        room_id: 房间ID
        request: 协作任务请求，包含描述、选中的智能体和执行顺序
    """
    try:
        # 获取会话
        session = get_session(room_id)
        
        # 创建智能体系统
        triage_agent = create_agent_system()

        # 构建智能体映射 - 直接从 triage_agent.handoffs 中获取智能体
        agent_map = {}
        for handoff in triage_agent.handoffs:
            agent_map[handoff.name.lower()] = handoff
            print(f"[DEBUG] 添加智能体到映射: {handoff.name.lower()} -> {handoff.name}")
            
            # 为中文名智能体添加英文 ID 映射
            if handoff.name == "商人":
                agent_map["merchant"] = handoff
                print(f"[DEBUG] 添加额外映射: merchant -> 商人")
            elif handoff.name == "运动员":
                agent_map["athlete"] = handoff
                print(f"[DEBUG] 添加额外映射: athlete -> 运动员")
            elif handoff.name == "医生":
                agent_map["doctor"] = handoff
                print(f"[DEBUG] 添加额外映射: doctor -> 医生")
        
        print(f"[DEBUG] 可用智能体: {list(agent_map.keys())}")

        # 确保所有请求的智能体都存在
        for agent_id in request.agent_order:
            if agent_id not in agent_map:
                raise HTTPException(
                    status_code=400,
                    detail=f"智能体 '{agent_id}' 不存在。可用智能体: {list(agent_map.keys())}"
                )
        
        # 按照指定顺序执行智能体
        results = []
        context = f"任务描述：{request.description}\n\n"
        
        for i, agent_id in enumerate(request.agent_order):
            if agent_id not in agent_map:
                continue
            
            agent = agent_map[agent_id]
            agent_name = agent.name
            
            # 构建上下文消息（包含之前智能体的结果）
            if i > 0:
                context += f"\n之前智能体的结果：\n"
                for j in range(i):
                    prev_agent_id = request.agent_order[j]
                    prev_result = results[j]
                    context += f"- {prev_result['agent_name']}: {prev_result['output'][:200]}...\n"
                context += "\n"
            
            context += f"请{agent_name}根据以上信息完成任务。"
            
            # 运行智能体
            result = await Runner.run(agent, context, session=session)
            
            # 获取当前世界状态
            world_state = state_store.get_world(room_id)
            
            results.append({
                "agent_id": agent_id,
                "agent_name": agent_name,
                "output": result.final_output,
                "world_state": world_state
            })
        
        # 生成汇总
        if len(results) > 0:
            summary = f"## 任务完成汇总\n\n"
            summary += f"**任务描述**: {request.description}\n\n"
            summary += f"**参与智能体**: {', '.join([r['agent_name'] for r in results])}\n\n"
            summary += f"**执行顺序**: {' → '.join([r['agent_name'] for r in results])}\n\n"
            summary += "---\n\n"
            
            for i, result in enumerate(results, 1):
                summary += f"### {i}. {result['agent_name']}\n\n"
                summary += f"{result['output']}\n\n"
                summary += "---\n\n"
            
            summary += f"\n**最终状态**: 所有智能体已按顺序完成任务，结果已汇总。"
        else:
            summary = "没有智能体参与任务。"
        
        # 获取最终世界状态
        final_world_state = state_store.get_world(room_id)
        
        return CollaborativeTaskResponse(
            results=results,
            summary=summary,
            final_world_state=final_world_state
        )
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"处理协作任务时出错: {str(e)}")

@app.post("/api/analyze-task", response_model=TaskAnalysisResponse)
async def analyze_task(request: TaskAnalysisRequest):
    """分析任务并生成执行计划"""
    try:
        plan = plan_task(request.description)
        return TaskAnalysisResponse(**plan)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"任务分析失败: {str(e)}")

@app.websocket("/ws/rooms/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket 连接，用于实时状态更新"""
    await manager.connect(websocket)
    try:
        # 发送初始状态
        world_state = state_store.get_world(room_id)
        await websocket.send_json({
            "type": "world_state",
            "data": world_state
        })
        
        # 保持连接，等待消息
        while True:
            data = await websocket.receive_text()
            # 这里可以处理来自客户端的消息
            # 目前只是保持连接，状态更新通过 HTTP 接口触发
            await websocket.send_json({
                "type": "echo",
                "message": f"收到消息: {data}"
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
