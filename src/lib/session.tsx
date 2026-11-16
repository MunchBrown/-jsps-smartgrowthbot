import React from "react";
import { onIdTokenChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { api } from "./api";

export interface Plan {
  id: "starter" | "professional" | "premium";
  name: string;
  priceMonthly: number;
  seats: number;
  leadsPerMonth: number;
  aiRequestsPerDay: number;
}

export interface Me {
  user: { uid: string; email: string; emailVerified: boolean; role: "owner" | "admin" | "member" | null };
  org: null | {
    id: string;
    name: string;
    plan: Plan["id"] | null;
    profile: any;
    integrations: any;
    subscription: { status: string; trialEnd: string | null; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean };
  };
  usage: null | { month: string; leads: number; leadLimit: number };
  pendingInvite: null | { orgName: string; role: string };
  plans: Plan[];
}

interface SessionValue {
  user: User | null;
  me: Me | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

const SessionContext = React.createContext<SessionValue>({ user: null, me: null, loading: true, error: "", refresh: async () => {} });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [me, setMe] = React.useState<Me | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const refresh = React.useCallback(async () => {
    if (!auth.currentUser) {
      setMe(null);
      return;
    }
    try {
      setError("");
      setMe(await api<Me>("/api/me"));
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  React.useEffect(() => {
    let lastUid: string | null = null; // null = not yet known
    return onIdTokenChanged(auth, async (u) => {
      setUser(u);
      // Only reload account details when the signed-in person changes.
      if ((u?.uid || "") !== lastUid) {
        lastUid = u?.uid || "";
        setLoading(true);
        if (u) await refresh();
        else setMe(null);
        setLoading(false);
      }
    });
  }, [refresh]);

  return <SessionContext.Provider value={{ user, me, loading, error, refresh }}>{children}</SessionContext.Provider>;
}

export const useSession = () => React.useContext(SessionContext);

export const isAdmin = (me: Me | null) => me?.user.role === "owner" || me?.user.role === "admin";
