"use client";
import useAuth from "@/utils/useAuth";
import { useEffect } from "react";

function MainComponent() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut({ callbackUrl: "/", redirect: true });
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F4F7F2]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto mb-4"></div>
        <p className="text-[#2E4D2E] font-medium">Signing you out...</p>
      </div>
    </div>
  );
}

export default MainComponent;
