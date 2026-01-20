"""会话管理模块"""
from agents.memory import SQLiteSession
from typing import Optional
import os

# 会话存储目录
SESSION_DB_DIR = "backend/data/sessions"
os.makedirs(SESSION_DB_DIR, exist_ok=True)

# 全局会话缓存
_sessions: dict[str, SQLiteSession] = {}

def get_session(room_id: str) -> SQLiteSession:
    """获取或创建指定房间的会话"""
    if room_id not in _sessions:
        db_path = os.path.join(SESSION_DB_DIR, f"{room_id}.db")
        _sessions[room_id] = SQLiteSession(room_id, db_path)
    return _sessions[room_id]

def clear_session(room_id: str) -> None:
    """清空指定房间的会话"""
    if room_id in _sessions:
        session = _sessions[room_id]
        # 注意：SQLiteSession 可能没有 clear_session 方法，这里先删除缓存
        del _sessions[room_id]
        # 也可以删除数据库文件
        db_path = os.path.join(SESSION_DB_DIR, f"{room_id}.db")
        if os.path.exists(db_path):
            os.remove(db_path)
