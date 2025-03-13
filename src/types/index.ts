export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  profilePicture?: string;
  rating: number;
  wins: number;
  losses: number;
  friends: string[];
  createdAt: Date;
}

export interface Match {
  id: string;
  participants: string[];
  status: 'waiting' | 'in-progress' | 'completed';
  scores: Record<string, number>;
  startTime: Date;
  endTime?: Date;
} 