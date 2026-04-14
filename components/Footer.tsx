"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBrandInstagram,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandDiscord,
} from "@tabler/icons-react";
import constants from "@/constants";

export default function Footer() {
  const pathname = usePathname();

  // Don't render footer on /schedule
  if (pathname === "/schedule") return null;
  if (pathname === "/info") return null;

  return (
    <footer className="bg-gray-100 text-gray-600 py-6 w-full">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Social Links on the left */}
        <div className="flex space-x-4 text-gray-500">
          <Link
            href={constants.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            <IconBrandDiscord size={20} />
          </Link>
          <Link
            href="https://www.instagram.com/thehackku/"
            target="_blank"
            className="hover:text-pink-600 transition-colors"
          >
            <IconBrandInstagram size={20} />
          </Link>
          <Link
            href="https://www.linkedin.com/company/hackku/about/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-700 transition-colors"
          >
            <IconBrandLinkedin size={20} />
          </Link>
          <Link
            href="https://github.com/the-hackku/hackku26_website"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            <IconBrandGithub size={20} />
          </Link>
        </div>

        {/* Text on the right */}
        <div className="text-right">
          <p className="text-sm text-gray-500">
            ©{new Date().getFullYear()} HackKU Team
          </p>
        </div>
      </div>

      {/* Center text */}
      <div className="container mx-auto px-4 pt-4 flex justify-between items-center" >
        <div className="flex flex-col text-gray-400 underline underline-offset-2">
          <Link
            href="/mlh/code-of-conduct"
            target="_blank"
            rel="noopener noreferrer"
          >
            MLH Code of Conduct
          </Link>
          <Link
            href="/legal/code-of-conduct"
            target="_blank"
            rel="noopener noreferrer"
          >
            HackKU Code of Conduct
          </Link>
          <Link
            href="/legal/waiver"
            target="_blank"
            rel="noopener noreferrer"
          >
            Photo Release Waiver
          </Link>
        </div>
      </div>
    </footer>
  );
}
