// Mock data for U-fresher ❤ platform

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'junior';
  profilePic: string;
  age: number;
  college: string;
  stream: string;
  availableForMentorship?: boolean;
  joinedCommunities: string[];
  joinedClubs: string[];
  connectedMentors: string[];
}

export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  clubs: Club[];
  mentors: User[];
  chatRooms: ChatRoom[];
}

export interface Club {
  id: string;
  name: string;
  description: string;
  communityId: string;
  clubHead: string;
  memberCount: number;
  chatRooms: ChatRoom[];
}

export interface ChatRoom {
  id: string;
  name: string;
  communityId?: string;
  clubId?: string;
  createdBy: string;
  memberCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  roomId: string;
}

// Profile pictures
export const profilePics = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic2",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic5",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic6",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic7",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic8"
];

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@ufresher.com',
    role: 'admin',
    profilePic: profilePics[0],
    age: 25,
    college: 'GLA University',
    stream: 'Computer Science',
    joinedCommunities: ['1', '2'],
    joinedClubs: ['1', '2'],
    connectedMentors: []
  },
  {
    id: '2',
    name: 'Dr. Sarah Smith',
    email: 'sarah@ufresher.com',
    role: 'mentor',
    profilePic: profilePics[1],
    age: 28,
    college: 'GLA University',
    stream: 'Computer Science',
    availableForMentorship: true,
    joinedCommunities: ['1'],
    joinedClubs: ['1'],
    connectedMentors: []
  },
  {
    id: '3',
    name: 'Alex Johnson',
    email: 'alex@ufresher.com',
    role: 'junior',
    profilePic: profilePics[2],
    age: 19,
    college: 'GLA University',
    stream: 'Computer Science',
    joinedCommunities: ['1'],
    joinedClubs: ['1'],
    connectedMentors: ['2']
  }
];

// Mock communities
export const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'GLA University',
    description: 'Official community for GLA University students and alumni',
    memberCount: 1250,
    clubs: [],
    mentors: [],
    chatRooms: []
  },
  {
    id: '2',
    name: 'IIT Delhi',
    description: 'Connect with IIT Delhi students and faculty',
    memberCount: 2300,
    clubs: [],
    mentors: [],
    chatRooms: []
  }
];

// Mock clubs
export const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Tech Innovators',
    description: 'For students passionate about technology and innovation',
    communityId: '1',
    clubHead: 'Dr. Sarah Smith',
    memberCount: 45,
    chatRooms: []
  },
  {
    id: '2',
    name: 'AI Research Group',
    description: 'Exploring the frontiers of Artificial Intelligence',
    communityId: '1',
    clubHead: 'Prof. John Doe',
    memberCount: 32,
    chatRooms: []
  }
];

// Mock chat rooms
export const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'General Discussion',
    communityId: '1',
    createdBy: '2',
    memberCount: 25,
    lastMessage: 'Hey everyone! How are your studies going?',
    lastMessageTime: '2 hours ago'
  },
  {
    id: '2',
    name: 'Project Collaboration',
    clubId: '1',
    createdBy: '3',
    memberCount: 12,
    lastMessage: 'Anyone interested in a React project?',
    lastMessageTime: '30 minutes ago'
  }
];

// Auth state management
export let currentUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

export const getCurrentUser = () => currentUser;

// Mock authentication
export const mockAuth = {
  login: (email: string, password: string, adminCode?: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (adminCode === 'Createrkkrishavya') {
          resolve(mockUsers.find(u => u.role === 'admin') || null);
        } else {
          const user = mockUsers.find(u => u.email === email);
          resolve(user || null);
        }
      }, 1000);
    });
  },

  googleLogin: (): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockUsers[1]); // Return mentor user for demo
      }, 1000);
    });
  },

  register: (userData: Partial<User>): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'junior',
          profilePic: userData.profilePic || profilePics[0],
          age: userData.age || 18,
          college: userData.college || '',
          stream: userData.stream || '',
          availableForMentorship: userData.role === 'mentor' ? false : undefined,
          joinedCommunities: [],
          joinedClubs: [],
          connectedMentors: []
        };
        mockUsers.push(newUser);
        resolve(newUser);
      }, 1000);
    });
  },

  logout: () => {
    setCurrentUser(null);
  }
};