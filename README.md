# 多智能体协作系统

一个基于 openai-agents-python 的多智能体可视化 Web 项目。用户以"上帝视角"管理虚拟城市中的三个智能体：数学家、艺术家、工程师。他们具备编程能力，完全服从用户，帮助用户完成复杂的问题分析并产出通俗易懂的回答，同时运用编程能力将想法可视化。

## 项目结构

```
duozhinengti1/
├── backend/          # Python 后端
│   ├── agent_systems/  # 智能体定义（原名 agents）
│   │   ├── __init__.py
│   │   └── agents.py
│   ├── app.py       # FastAPI 应用
│   ├── state_store.py  # 世界状态存储
│   ├── sessions.py  # 会话管理
│   ├── run.py       # 启动脚本
│   ├── .env         # 环境变量配置
│   └── requirements.txt
├── frontend/        # React + TypeScript 前端
│   ├── src/
│   │   ├── components/  # 组件
│   │   │   ├── Agent.tsx
│   │   │   ├── WorldCanvas.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── TaskPublisher.tsx
│   │   │   └── CollaborativeResult.tsx
│   │   ├── api.ts   # API 客户端
│   │   ├── types.ts # 类型定义
│   │   └── App.tsx  # 主应用
│   └── package.json
└── README.md
```

## 快速开始

### 前置要求

- Python 3.9+
- Node.js 16+
- OpenAI API Key

### 1. 后端设置

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
# 编辑 .env 文件，设置：
# OPENAI_API_KEY=your_openai_api_key_here

# 启动后端
python run.py
```

后端将在 http://localhost:8000 运行

### 2. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 http://localhost:5173 运行

### 3. 访问应用

打开浏览器访问：http://localhost:5173

## 使用指南

### 单智能体对话

1. 在聊天面板中输入消息
2. 点击发送按钮
3. 智能体会自动响应你的问题
4. 可以在聊天记录中查看对话历史

### 多智能体协作任务

1. 点击页面顶部的"📋 发布协作任务"按钮
2. 在弹窗中输入任务描述
3. 勾选需要参与的智能体（可多选）
4. 使用上下箭头调整智能体执行顺序
5. 点击"发布任务"按钮
6. 智能体按顺序协作完成任务
7. 查看任务完成汇总报告

**协作任务特点：**
- 智能体按指定顺序逐个完成任务
- 后续智能体可以看到前面智能体的结果
- 自动生成任务完成汇总报告
- 显示每个智能体的详细输出

## 功能特性

### 智能体系统

- **任务分配员**：智能路由系统，根据用户需求自动分配任务
- **数学家**：擅长数学分析、逻辑推理、算法问题
- **艺术家**：擅长视觉设计、创意表达、用户体验
- **工程师**：擅长编程实现、代码开发、技术实现

### 可视化界面

- **虚拟城市**：显示智能体在虚拟城市中的位置和状态
- **实时对话**：与智能体系统进行自然语言对话
- **状态同步**：实时显示智能体的情绪、任务状态
- **角色选择**：可以选择特定智能体或自动分配
- **小王子风格**：卡通化设计，童话风格视觉体验
- **协作任务**：支持多智能体协作，可以指定执行顺序，智能体按顺序完成任务并汇总结果

## API 端点

### HTTP API

- `GET /` - API 信息
- `GET /api/health` - 健康检查
- `POST /api/rooms/{room_id}/message` - 发送消息
  - 请求体：`{"message": "消息内容", "target_agent": "mathematician|artist|engineer"}`
  - 响应：`{"output": "回复内容", "world_state": {...}, "agent_used": "使用的智能体"}`
- `POST /api/rooms/{room_id}/collaborative-task` - 发布协作任务
  - 请求体：`{"description": "任务描述", "selected_agents": ["agent1", "agent2"], "agent_order": ["agent1", "agent2"]}`
  - 响应：`{"results": [...], "summary": "任务汇总", "final_world_state": {...}}`
- `GET /api/rooms/{room_id}/state` - 获取世界状态
- `DELETE /api/rooms/{room_id}` - 清空房间

### WebSocket

- `WS /ws/rooms/{room_id}` - WebSocket 连接（实时状态更新）

## 技术栈

### 后端

- Python 3.9+
- openai-agents-python (>=0.6.8) - 多智能体框架
- FastAPI (>=0.104.0) - Web 框架
- Uvicorn - ASGI 服务器
- python-dotenv - 环境变量管理
- eval_type_backport - Python 3.9 类型支持

### 前端

- React 19.2.0
- TypeScript
- Vite 7.2.4
- CSS3

## 开发说明

### 后端开发

后端代码位于 `backend/` 目录：

- `agent_systems/agents.py` - 智能体定义
  - `create_agent_system()` - 创建完整的智能体系统
  - `update_world_state()` - 更新世界状态
  - `query_world_state()` - 查询世界状态
  - `render_idea_to_svg()` - 渲染可视化内容
- `app.py` - FastAPI 应用主文件
  - HTTP API 端点
  - WebSocket 连接管理
  - CORS 配置
- `state_store.py` - 世界状态管理
  - 内存状态存储
  - 文件持久化
  - 事件驱动更新
- `sessions.py` - 会话管理
  - SQLite 会话存储
  - 会话生命周期管理

### 前端开发

前端代码位于 `frontend/src/` 目录：

- `App.tsx` - 主应用组件
- `components/` - 可视化组件
  - `Agent.tsx` - 智能体组件（显示位置、情绪、任务）
  - `WorldCanvas.tsx` - 世界画布（虚拟城市背景）
  - `ChatPanel.tsx` - 聊天面板（对话界面）
  - `TaskPublisher.tsx` - 任务发布组件（多智能体协作任务）
  - `CollaborativeResult.tsx` - 协作结果展示组件
- `api.ts` - API 客户端（HTTP 请求封装）
- `types.ts` - TypeScript 类型定义

## 故障排除

### 后端启动失败

1. **ModuleNotFoundError: No module named 'agents'**
   - 解决：确保已安装 `openai-agents` 包
   - 运行：`pip install -r requirements.txt`

2. **TypeError: unsupported operand type(s) for |**
   - 解决：安装 `eval_type_backport` 包
   - 运行：`pip install eval_type_backport`

3. **The api_key client option must be set**
   - 解决：检查 `.env` 文件是否正确配置
   - 确保 `.env` 文件没有 BOM 字符
   - 运行：`python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('OPENAI_API_KEY'))"`

### 前端启动失败

1. **Cannot connect to backend**
   - 确保后端服务正在运行
   - 检查后端地址：http://localhost:8000
   - 检查 CORS 配置

2. **npm install 失败**
   - 删除 `node_modules` 和 `package-lock.json`
   - 重新运行：`npm install`

## 项目特点

- **小王子风格**：智能体形象参考小王子童话风格，卡通化设计
- **多智能体协作**：智能体之间可以 handoff，协作完成任务
- **可视化交互**：直观的可视化界面，实时显示智能体状态
- **完全服从**：智能体完全服从用户指令，帮助完成复杂任务
- **状态持久化**：会话和世界状态持久化存储
- **实时更新**：支持 WebSocket 实时状态推送

## 运行状态

### 测试结果

✅ 后端服务运行正常 - http://localhost:8000
✅ 前端服务运行正常 - http://localhost:5173
✅ API 健康检查通过
✅ 消息发送功能正常
✅ 智能体响应正常
✅ 世界状态同步正常
✅ 协作任务功能正常
✅ 多智能体按顺序执行正常
✅ 结果汇总功能正常

### 示例对话

#### 单智能体对话

```
用户: 你好，请介绍一下你自己
智能体: 你好！我是虚拟城市中的任务分配员，专门帮助你把问题和需求分配给最合适的专家智能体...
```

#### 多智能体协作任务

```
任务描述: 设计一个简单的网页，包含标题和按钮
参与智能体: 艺术家、工程师
执行顺序: 艺术家 → 工程师

艺术家: 设计方案如下：
- 顶部大标题，使用童趣或艺术感字体
- 页面中部有一个明亮的圆角大按钮
- 背景是柔和渐变色
- 标题："欢迎体验AI创造力"
- 按钮文字："点我开始探索"

工程师: 好的，下面给出一个符合上述设计规范的简单网页实现：
[HTML/CSS 代码...]
```

### 协作任务示例

**任务：** 设计一个简单的网页，包含标题和按钮

**执行流程：**
1. **艺术家**首先提供设计方案
2. **工程师**根据设计方案实现代码

**结果汇总：**
- 艺术家提供了完整的设计规范
- 工程师实现了符合设计的 HTML/CSS 代码
- 两个智能体协作完成了一个完整的网页开发任务

## 许可证

MIT

## 致谢

- [openai-agents-python](https://github.com/openai/openai-agents-python) - 多智能体框架
- FastAPI - 现代 Web 框架
- React - UI 框架
- Vite - 构建工具
