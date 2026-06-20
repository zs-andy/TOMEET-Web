import { Conversation, Message } from "./types";

const now = Date.now();
const hour = 3600000;
const day = 86400000;

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    type: "matching",
    title: "周末爬山搭子",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "我想找人一起周末去爬山，最好是有经验的",
        timestamp: now - 2 * hour,
      },
      {
        id: "msg-2",
        role: "agent",
        content: "好的！我来帮你找找附近喜欢户外运动的人。你一般喜欢爬什么难度的山？有什么时间偏好吗？",
        timestamp: now - 2 * hour + 2000,
      },
      {
        id: "msg-3",
        role: "user",
        content: "中等难度就好，周六上午出发",
        timestamp: now - hour,
      },
      {
        id: "msg-4",
        role: "agent",
        content: "找到 3 位匹配的朋友！这是最适合你的：",
        timestamp: now - hour + 2000,
        match: {
          name: "小鱼",
          description: "户外爱好者 · 每周登山 · 3年经验",
          avatarInitial: "鱼",
        },
      },
    ],
    createdAt: now - 2 * hour,
    updatedAt: now - hour + 2000,
  },
  {
    id: "conv-2",
    type: "matching",
    title: "黑客松组队",
    messages: [
      {
        id: "msg-5",
        role: "user",
        content: "有没有人想一起组队参加黑客松？",
        timestamp: now - day,
      },
      {
        id: "msg-6",
        role: "agent",
        content: "当然！你想做什么方向的项目？有什么技术栈偏好吗？",
        timestamp: now - day + 2000,
      },
    ],
    createdAt: now - day,
    updatedAt: now - day + 2000,
  },
];

const agentReplies: Record<string, string[]> = {
  profile_building: [
    "很高兴认识你！先聊聊你平时喜欢做什么吧？工作之余有什么爱好？",
    "听起来很有趣！那你一般喜欢什么社交场景？比如小聚、户外活动还是线上交流？",
    "明白了。那在认识新朋友的时候，你比较看重什么？比如共同兴趣、性格互补？",
    "太好了，我对你有了不错的了解。你的画像正在完善中，随时可以继续聊天来补充更多信息！",
  ],
  matching: [
    "我来帮你看看有没有合适的人选。你能再具体说说你的需求吗？",
    "明白了！让我找找看...",
    "根据你的描述，我找到了几位可能合适的人。你想了解他们的哪方面？",
    "好的，我再帮你筛选一下。你还有什么其他要求吗？",
  ],
};

let replyIndex: Record<string, number> = {};

export function getNextAgentReply(conversationType: string): string {
  if (!replyIndex[conversationType]) {
    replyIndex[conversationType] = 0;
  }
  const replies = agentReplies[conversationType] || agentReplies.matching;
  const reply = replies[replyIndex[conversationType] % replies.length];
  replyIndex[conversationType]++;
  return reply;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createNewConversation(
  type: "profile_building" | "matching",
  title: string
): Conversation {
  return {
    id: generateId(),
    type,
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function createMessage(
  role: "user" | "agent",
  content: string,
  match?: Message["match"]
): Message {
  return {
    id: generateId(),
    role,
    content,
    timestamp: Date.now(),
    match,
  };
}
