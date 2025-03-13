'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserProfile } from '@/src/lib/firebase/user';
import { isAdmin } from '@/src/lib/auth/admin';
import type { UserProfile } from '@/src/lib/firebase/user';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import {
  Users,
  Trophy,
  UserCircle,
  Settings as SettingsIcon,
  LogOut,
  Play,
  Target,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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

  const navigation = [
    {
      name: 'Play',
      href: '/dashboard/play',
      icon: Play,
      current: pathname === '/dashboard/play',
    },
    {
      name: 'Leaderboard',
      href: '/dashboard/leaderboard',
      icon: Trophy,
      current: pathname === '/dashboard/leaderboard',
    },
    {
      name: 'Friends',
      href: '/dashboard/friends',
      icon: Users,
      current: pathname === '/dashboard/friends',
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserCircle,
      current: pathname === '/dashboard/profile',
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: SettingsIcon,
      current: pathname === '/dashboard/settings',
    },
  ];

  if (isAdmin()) {
    navigation.push({
      name: 'Admin',
      href: '/admin/questions',
      icon: Target,
      current: pathname.startsWith('/admin'),
    });
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar>
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage 
                src={profile?.profilePicture || '/default-avatar.png'} 
                alt={profile?.username || 'User avatar'} 
              />
              <AvatarFallback className="bg-primary/10">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.username || 'Anonymous User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1">
          <nav className="space-y-1 p-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={item.current ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => router.push(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
} 