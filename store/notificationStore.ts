// store/notificationStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AppNotification {
  id: string;
  type: "offer" | "order" | "cart" | "loyalty" | "system";
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  icon?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isPanelOpen: boolean;
  addNotification: (n: Omit<AppNotification, "id" | "read" | "timestamp">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  setPanelOpen: (open: boolean) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isPanelOpen: false,

      addNotification: (n) => {
        const newNote: AppNotification = {
          ...n,
          id:        crypto.randomUUID(),
          read:      false,
          timestamp: new Date().toISOString(),
        };
        set((s) => ({
          notifications: [newNote, ...s.notifications].slice(0, 50), // cap at 50
          unreadCount:   s.unreadCount + 1,
        }));
      },

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
          unreadCount:   Math.max(0, s.unreadCount - 1),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
          unreadCount:   0,
        })),

      removeNotification: (id) =>
        set((s) => {
          const note = s.notifications.find((n) => n.id === id);
          return {
            notifications: s.notifications.filter((n) => n.id !== id),
            unreadCount:   note && !note.read ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
          };
        }),

      setPanelOpen: (open) => set({ isPanelOpen: open }),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: "daog-notifications-v1",
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount:   state.unreadCount,
      }),
    }
  )
);
