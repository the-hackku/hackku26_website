"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconSpeakerphone } from "@tabler/icons-react";
import { motion } from "framer-motion";

const DISABLED_PAGES = [
  "/announcements",
  "/scanner"
]

export default function AnnouncementsButton() {
  const pathname = usePathname();

  if (pathname in DISABLED_PAGES) return null;

  return (
    <Link href="/announcements">
      <motion.div
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-background border shadow-lg px-4 py-3 text-sm font-medium cursor-pointer hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.span
          animate={{ color: ["#ef4444", "#991b1b", "#ef4444"] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <IconSpeakerphone size={20} />
        </motion.span>
        Announcements
      </motion.div>
    </Link>
  );
}
