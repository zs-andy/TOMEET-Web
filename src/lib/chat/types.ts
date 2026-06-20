export type ConversationType = "profile_building" | "matching";

export type MatchInfo = {
  name: string;
  description: string;
  avatarInitial: string;
};

export type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
  match?: MatchInfo;
};

export type Conversation = {
  id: string;
  type: ConversationType;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

export type ChatState = {
  conversations: Conversation[];
  activeConversationId: string | null;
  isAgentTyping: boolean;
  profileBuildingDismissed: boolean;
  hasCompletedProfile: boolean;
};

export type ChatAction =
  | { type: "SET_ACTIVE_CONVERSATION"; id: string | null }
  | { type: "CREATE_CONVERSATION"; conversation: Conversation }
  | { type: "ADD_MESSAGE"; conversationId: string; message: Message }
  | { type: "SET_AGENT_TYPING"; isTyping: boolean }
  | { type: "DISMISS_PROFILE_BUILDING" }
  | { type: "COMPLETE_PROFILE" }
  | { type: "DELETE_CONVERSATION"; id: string };
