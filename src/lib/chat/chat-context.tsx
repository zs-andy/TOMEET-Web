"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import {
  ChatState,
  ChatAction,
  Conversation,
  Message,
} from "./types";
import {
  mockConversations,
  getNextAgentReply,
  createMessage,
  createNewConversation,
} from "./mock-data";

const initialState: ChatState = {
  conversations: mockConversations,
  activeConversationId: null,
  isAgentTyping: false,
  profileBuildingDismissed: false,
  hasCompletedProfile: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_ACTIVE_CONVERSATION":
      return { ...state, activeConversationId: action.id };
    case "CREATE_CONVERSATION":
      return {
        ...state,
        conversations: [action.conversation, ...state.conversations],
        activeConversationId: action.conversation.id,
      };
    case "ADD_MESSAGE": {
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.conversationId
            ? {
                ...conv,
                messages: [...conv.messages, action.message],
                updatedAt: action.message.timestamp,
                title:
                  conv.messages.length === 0 && action.message.role === "user"
                    ? action.message.content.slice(0, 20)
                    : conv.title,
              }
            : conv
        ),
      };
    }
    case "SET_AGENT_TYPING":
      return { ...state, isAgentTyping: action.isTyping };
    case "DISMISS_PROFILE_BUILDING":
      return { ...state, profileBuildingDismissed: true };
    case "COMPLETE_PROFILE":
      return { ...state, hasCompletedProfile: true };
    case "DELETE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter((c) => c.id !== action.id),
        activeConversationId:
          state.activeConversationId === action.id
            ? null
            : state.activeConversationId,
      };
    default:
      return state;
  }
}

type ChatContextValue = {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (content: string) => void;
  createChat: (type: Conversation["type"], title?: string) => void;
  setActiveConversation: (id: string | null) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const sendMessage = useCallback(
    (content: string) => {
      const { activeConversationId, conversations } = state;
      if (!activeConversationId) return;

      const conversation = conversations.find(
        (c) => c.id === activeConversationId
      );
      if (!conversation) return;

      // Add user message
      const userMessage = createMessage("user", content);
      dispatch({
        type: "ADD_MESSAGE",
        conversationId: activeConversationId,
        message: userMessage,
      });

      // Simulate agent typing
      dispatch({ type: "SET_AGENT_TYPING", isTyping: true });

      setTimeout(() => {
        const reply = getNextAgentReply(conversation.type);
        const agentMessage = createMessage("agent", reply);
        dispatch({
          type: "ADD_MESSAGE",
          conversationId: activeConversationId,
          message: agentMessage,
        });
        dispatch({ type: "SET_AGENT_TYPING", isTyping: false });
      }, 1500);
    },
    [state]
  );

  const createChat = useCallback(
    (type: Conversation["type"], title?: string) => {
      const defaultTitle =
        type === "profile_building" ? "建立画像" : "新对话";
      const conversation = createNewConversation(type, title || defaultTitle);
      dispatch({ type: "CREATE_CONVERSATION", conversation });

      // If profile building, send initial agent message
      if (type === "profile_building") {
        setTimeout(() => {
          const greeting = createMessage(
            "agent",
            "嗨！欢迎来到 Rendez。我是你的社交助手，帮你找到志同道合的人。先聊聊你自己吧——平时喜欢做什么？有什么兴趣爱好？"
          );
          dispatch({
            type: "ADD_MESSAGE",
            conversationId: conversation.id,
            message: greeting,
          });
        }, 800);
      }
    },
    []
  );

  const setActiveConversation = useCallback((id: string | null) => {
    dispatch({ type: "SET_ACTIVE_CONVERSATION", id });
  }, []);

  return (
    <ChatContext.Provider
      value={{ state, dispatch, sendMessage, createChat, setActiveConversation }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
}
