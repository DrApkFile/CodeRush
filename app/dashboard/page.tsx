// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const navigateTo = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className={styles.menuButton}>
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={styles.sidebar}>
            <nav className={styles.nav}>
              <Button
                variant="ghost"
                className={styles.navButton}
                onClick={() => navigateTo("/play")}
              >
                Play
              </Button>
              <Button
                variant="ghost"
                className={styles.navButton}
                onClick={() => navigateTo("/leaderboard")}
              >
                Leaderboard
              </Button>
              <Button
                variant="ghost"
                className={styles.navButton}
                onClick={() => navigateTo("/friends")}
              >
                Friends
              </Button>
              <Button
                variant="ghost"
                className={styles.navButton}
                onClick={() => navigateTo("/profile")}
              >
                Profile
              </Button>
              <Button
                variant="ghost"
                className={styles.navButton}
                onClick={() => navigateTo("/settings")}
              >
                Settings
              </Button>
              <Button
                variant="ghost"
                className={styles.logoutButtonSidebar}
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className={styles.title}>Code Rush Dashboard</h1>
        <Button
          variant="outline"
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </header>
      <main className={styles.main}>
        <p>Welcome to your dashboard! Select an option from the sidebar to get started.</p>
      </main>
    </div>
  );
}