/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import User from "~/models/User";

type UserState = {
  users: User[];
  setUsers: (users: User[]) => void;
};

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: [],
      setUsers: (users) => set({ users }),
    }),
    {
      name: "user-storage",
    }
  )
);

export default useUserStore;
