# 多智能体协作系统 - 后端

## 环境配置

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 配置环境变量：
创建 `.env` 文件，设置：
```
OPENAI_API_KEY=your_openai_api_key_here
```

## 运行

启动后端服务：
```bash
python run.py
```

或使用 uvicorn 直接启动：
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## API 端点

- `GET /` - API 信息
- `GET /api/health` - 健康检查
- `POST /api/rooms/{room_id}/message` - 发送消息
- `GET /api/rooms/{room_id}/state` - 获取世界状态
- `DELETE /api/rooms/{room_id}` - 清空房间
- `WS /ws/rooms/{room_id}` - WebSocket 连接

## 测试

运行 Hello World 测试：
```bash
python hello_agents.py
```
