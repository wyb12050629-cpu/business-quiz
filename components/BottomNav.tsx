"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy } from "lucide-react";

const tabs = [
  { href: "/", label: "홈", icon: Home },
  { href: "/points", label: "포인트", icon: Trophy },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                isActive ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
