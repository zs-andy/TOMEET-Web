"use client";

/**
 * Zustand store for chat state.
 *
 * 为什么用 Zustand 替代 React Context + useReducer：
 *
 * 1. **无需 Provider** — Zustand store 是模块级单例，组件直接 import 使用，
 *    不用在 layout 里套 <ChatProvider>。
 *
 * 2. **精细订阅，避免多余渲染** — useChatContext() 时可以传 selector：
 *      const isTyping = useChatStore(s => s.isAgentTyping)
 *    只有 isAgentTyping 变化时该组件才重渲染，其他字段变化不触发。
 *    Context 方案下，任何字段变化都会让所有消费者重渲染。
 *
 * 3. **扁平 API** — 去掉 state.xxx 嵌套，actions 直接挂在 store 上，
 *    不再需要 dispatch({ type: "..." }) 样板代码。
 *
 * 4. **actions 内部可读当前 state** — 用 get() 在 action 内部读最新状态，
 *    不像 useReducer 需要把 state 传进来或用 useCallback 依赖。
 */

import { create } from "zustand";
import { ChatState, Conversation } from "./types";
import {
  mockConversations,
  getNextAgentReply,
  createMessage,
  createNewConversation,
} from "./mock-data";

type ChatStore = ChatState & {
  sendMessage: (content: string) => void;
  createChat: (type: Conversation["type"], title?: string) => void;
  setActiveConversation: (id: string | null) => void;
  dismissProfileBuilding: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: mockConversations,
  activeConversationId: null,
  isAgentTyping: false,
  profileBuildingDismissed: false,
  hasCompletedProfile: false,

  sendMessage: (content) => {
    const { activeConversationId, conversations } = get();
    if (!activeConversationId) return;
    const conversation = conversations.find((c) => c.id === activeConversationId);
    if (!conversation) return;

    const userMessage = createMessage("user", content);
    set((s) => ({
      isAgentTyping: true,
      conversations: s.conversations.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              updatedAt: userMessage.timestamp,
              title: c.messages.length === 0 ? content.slice(0, 20) : c.title,
            }
          : c
      ),
    }));

    setTimeout(() => {
      const agentMessage = createMessage("agent", getNextAgentReply(conversation.type));
      set((s) => ({
        isAgentTyping: false,
        conversations: s.conversations.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...c.messages, agentMessage], updatedAt: agentMessage.timestamp }
            : c
        ),
      }));
    }, 1500);
  },

  createChat: (type, title) => {
    const conversation = createNewConversation(
      type,
      title ?? (type === "profile_building" ? "建立画像" : "新对话")
    );
    set((s) => ({
      conversations: [conversation, ...s.conversations],
      activeConversationId: conversation.id,
    }));

    if (type === "profile_building") {
      setTimeout(() => {
        const greeting = createMessage(
          "agent",
          "嗨！欢迎来到 Rendez。我是你的社交助手，帮你找到志同道合的人。先聊聊你自己吧——平时喜欢做什么？有什么兴趣爱好？"
        );
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversation.id
              ? { ...c, messages: [...c.messages, greeting], updatedAt: greeting.timestamp }
              : c
          ),
        }));
      }, 800);
    }
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),
  dismissProfileBuilding: () => set({ profileBuildingDismissed: true }),
}));

/** 向后兼容别名，等同于 useChatStore */
export const useChatContext = useChatStore;
