"""系统测试脚本"""
import sys
import os
from pathlib import Path

# 设置编码
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# 添加路径
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

print("="*60)
print("系统测试")
print("="*60)

# 测试 1: 导入智能体系统
print("\n[测试 1] 导入智能体系统...")
try:
    from agent_systems import create_agent_system
    triage = create_agent_system()
    print(f"[OK] 智能体系统导入成功")
    print(f"  - 路由智能体: {triage.name}")
    print(f"  - 可用智能体数量: {len(triage.handoffs)}")
    print(f"  - 智能体列表: {[a.name for a in triage.handoffs]}")
except Exception as e:
    print(f"[ERROR] 导入失败: {e}")
    sys.exit(1)

# 测试 2: 状态存储
print("\n[测试 2] 测试状态存储...")
try:
    from state_store import get_state_store
    store = get_state_store()
    world = store.get_world('test')
    print(f"[OK] 状态存储测试成功")
    print(f"  - 智能体数量: {len(world['agents'])}")
    print(f"  - 智能体列表: {[a['name'] for a in world['agents']]}")
except Exception as e:
    print(f"[ERROR] 状态存储失败: {e}")
    sys.exit(1)

# 测试 3: 会话管理
print("\n[测试 3] 测试会话管理...")
try:
    from sessions import get_session
    session = get_session('test')
    print(f"[OK] 会话管理测试成功")
    print(f"  - Session ID: {session.session_id}")
except Exception as e:
    print(f"[ERROR] 会话管理失败: {e}")
    sys.exit(1)

# 测试 4: FastAPI 应用导入
print("\n[测试 4] 测试 FastAPI 应用...")
try:
    import app
    print(f"[OK] FastAPI 应用导入成功")
    print(f"  - 应用标题: {app.app.title}")
    print(f"  - 应用版本: {app.app.version}")
except Exception as e:
    print(f"[ERROR] FastAPI 应用导入失败: {e}")
    sys.exit(1)

print("\n" + "="*60)
print("[SUCCESS] 所有测试通过！")
print("="*60)
print("\n可以启动服务：")
print("  后端: python run.py")
print("  前端: cd frontend && npm run dev")
