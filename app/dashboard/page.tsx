'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserProfile } from '@/src/lib/firebase/user';
import type { UserProfile } from '@/src/lib/firebase/user';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Activity,
  Star,
  Clock,
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
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

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Welcome back, {profile?.username || 'Anonymous'}!</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <p className="text-xl md:text-2xl font-bold">75%</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Rating</p>
                  <p className="text-xl md:text-2xl font-bold">1250</p>
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

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => router.push('/dashboard/play')}
        >
          Start Playing
        </Button>
      </div>
    </div>
  );
} 