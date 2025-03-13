'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserProfile } from '@/src/lib/firebase/user';
import { isAdmin } from '@/src/lib/auth/admin';
import type { UserProfile } from '@/src/lib/firebase/user';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Trophy,
  UserCircle,
  Settings as SettingsIcon,
  LogOut,
  Play,
  Activity,
  Star,
  Clock,
  Target,
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user, router]);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-6 space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage 
              src={profile?.profilePicture || '/default-avatar.png'} 
              alt={profile?.username || 'User avatar'} 
            />
            <AvatarFallback className="bg-primary/10">
              {profile?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <h2 className="font-semibold text-lg">{profile?.username || 'Anonymous User'}</h2>
            <p className="text-sm text-muted-foreground truncate max-w-[180px]">{user.email}</p>
            <div className="flex items-center justify-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="play" className="w-full" orientation="vertical">
          <TabsList className="flex flex-col h-auto space-y-2">
            <TabsTrigger value="play" className="w-full justify-start">
              <Play className="mr-2 h-4 w-4" />
              Play
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="w-full justify-start">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="friends" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="profile" className="w-full justify-start">
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="w-full justify-start">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
            {isAdmin() && (
              <TabsTrigger
                value="admin"
                className="w-full justify-start text-primary"
                onClick={() => router.push('/admin/questions')}
              >
                <Target className="mr-2 h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="play" className="p-6">
          <TabsContent value="play" className="space-y-4">
            <h2 className="text-2xl font-bold">Play</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Your gaming performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Win Rate</p>
                        <p className="text-2xl font-bold">75%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Rating</p>
                        <p className="text-2xl font-bold">1250</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest matches</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">JavaScript Challenge</p>
                          <p className="text-xs text-muted-foreground">Won against @player2</p>
                        </div>
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Global Rankings</CardTitle>
                <CardDescription>Top players this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add leaderboard content */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Online Friends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add online friends list */}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Friend Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add friend requests */}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Total Games</span>
                      </div>
                      <span className="font-bold">24</span>
                    </div>
                    {/* Add more stats */}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add achievements */}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add settings content */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 