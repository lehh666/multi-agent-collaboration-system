"""世界状态存储管理"""
from typing import Dict, List, Optional, Any
import json
import os
from datetime import datetime

class StateStore:
    """管理虚拟城市的世界状态（智能体的位置、情绪、任务等）"""
    
    def __init__(self, storage_path: str = "backend/data"):
        self.storage_path = storage_path
        os.makedirs(storage_path, exist_ok=True)
        # 内存中的状态：{room_id: {agents: [...], environment: {...}}}
        self._memory: Dict[str, Dict[str, Any]] = {}
    
    def get_world(self, room_id: str) -> Dict[str, Any]:
        """获取指定房间的世界状态"""
        if room_id not in self._memory:
            # 尝试从文件加载
            self._load_from_file(room_id)
        
        if room_id not in self._memory:
            # 初始化默认状态
            self._memory[room_id] = {
                "agents": [
                    {
                        "id": "mathematician",
                        "name": "Mathematician",
                        "role": "mathematician",
                        "x": 150,
                        "y": 250,
                        "mood": "calm",
                        "currentTask": None,
                        "relations": {}
                    },
                    {
                        "id": "artist",
                        "name": "Artist",
                        "role": "artist",
                        "x": 350,
                        "y": 250,
                        "mood": "creative",
                        "currentTask": None,
                        "relations": {}
                    },
                    {
                        "id": "engineer",
                        "name": "Engineer",
                        "role": "engineer",
                        "x": 550,
                        "y": 250,
                        "mood": "focused",
                        "currentTask": None,
                        "relations": {}
                    },
                    {
                        "id": "merchant",
                        "name": "Merchant",
                        "role": "merchant",
                        "x": 750,
                        "y": 250,
                        "mood": "cautious",
                        "currentTask": None,
                        "relations": {}
                    },
                    {
                        "id": "athlete",
                        "name": "Athlete",
                        "role": "athlete",
                        "x": 250,
                        "y": 450,
                        "mood": "energetic",
                        "currentTask": None,
                        "relations": {}
                    },
                    {
                        "id": "doctor",
                        "name": "Doctor",
                        "role": "doctor",
                        "x": 450,
                        "y": 450,
                        "mood": "caring",
                        "currentTask": None,
                        "relations": {}
                    }
                ],
                "environment": {
                    "timeOfDay": "day",
                    "weather": "sunny",
                    "rooms": []
                },
                "lastUpdated": datetime.now().isoformat()
            }
            self._save_to_file(room_id)
        
        return self._memory[room_id]
    
    def apply_events(self, room_id: str, events: List[Dict[str, Any]]) -> None:
        """应用事件更新世界状态"""
        world = self.get_world(room_id)
        
        for event in events:
            event_type = event.get("type")
            
            if event_type == "agent_moved":
                agent_id = event.get("agent_id")
                x = event.get("x")
                y = event.get("y")
                for agent in world["agents"]:
                    if agent["id"] == agent_id:
                        agent["x"] = x
                        agent["y"] = y
                        break
            
            elif event_type == "task_started":
                agent_id = event.get("agent_id")
                task = event.get("task")
                for agent in world["agents"]:
                    if agent["id"] == agent_id:
                        agent["currentTask"] = task
                        agent["mood"] = event.get("mood", agent["mood"])
                        break
            
            elif event_type == "task_finished":
                agent_id = event.get("agent_id")
                for agent in world["agents"]:
                    if agent["id"] == agent_id:
                        agent["currentTask"] = None
                        agent["mood"] = event.get("mood", "calm")
                        break
            
            elif event_type == "mood_changed":
                agent_id = event.get("agent_id")
                mood = event.get("mood")
                for agent in world["agents"]:
                    if agent["id"] == agent_id:
                        agent["mood"] = mood
                        break
        
        world["lastUpdated"] = datetime.now().isoformat()
        self._save_to_file(room_id)
    
    def _save_to_file(self, room_id: str) -> None:
        """保存状态到文件"""
        file_path = os.path.join(self.storage_path, f"{room_id}.json")
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(self._memory[room_id], f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存状态文件失败: {e}")
    
    def _load_from_file(self, room_id: str) -> None:
        """从文件加载状态"""
        file_path = os.path.join(self.storage_path, f"{room_id}.json")
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    self._memory[room_id] = json.load(f)
            except Exception as e:
                print(f"加载状态文件失败: {e}")
    
    def clear_room(self, room_id: str) -> None:
        """清空指定房间的状态"""
        if room_id in self._memory:
            del self._memory[room_id]
        file_path = os.path.join(self.storage_path, f"{room_id}.json")
        if os.path.exists(file_path):
            os.remove(file_path)

# 全局单例
_state_store = None

def get_state_store() -> StateStore:
    """获取全局状态存储实例"""
    global _state_store
    if _state_store is None:
        _state_store = StateStore()
    return _state_store
