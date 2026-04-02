"use client";

import constants from "@/constants";
import { motion } from "framer-motion";
import MemberImage from "./MemberImage";
import Image, { StaticImageData } from "next/image";
import {
  IconBrandLinkedin,
  IconWorld,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";

import aliviaSvg from "@/assets/images/fish/alivia.svg";
import luciaSvg from "@/assets/images/fish/lucia.svg";
import forestSvg from "@/assets/images/fish/forest.svg";
import aidenSvg from "@/assets/images/fish/aiden.svg";
import dellieSvg from "@/assets/images/fish/dellie.svg";
import kellySvg from "@/assets/images/fish/kelly.svg";
import anikethSvg from "@/assets/images/fish/aniketh.svg";
import adwaithSvg from "@/assets/images/fish/adwaith.svg";
import ibrahimSvg from "@/assets/images/fish/ibrahim.svg";
import addisonSvg from "@/assets/images/fish/addison.svg";
import richardSvg from "@/assets/images/fish/richard.svg";
import markSvg from "@/assets/images/fish/mark.svg";
import maralSvg from "@/assets/images/fish/maral.svg";
import kennySvg from "@/assets/images/fish/kenny.svg";
import jossSvg from "@/assets/images/fish/josselyn.svg";
import kevinhSvg from "@/assets/images/fish/kevinh.svg";

const fishMap: Record<string, StaticImageData> = {
  "alivia.svg": aliviaSvg,
  "lucia.svg": luciaSvg,
  "forest.svg": forestSvg,
  "aiden.svg": aidenSvg,
  "dellie.svg": dellieSvg,
  "kelly.svg": kellySvg,
  "aniketh.svg": anikethSvg,
  "adwaith.svg": adwaithSvg,
  "ibrahim.svg": ibrahimSvg,
  "addison.svg": addisonSvg,
  "richard.svg": richardSvg,
  "mark.svg": markSvg,
  "maral.svg": maralSvg,
  "kenny.svg": kennySvg,
  "joss.svg": jossSvg,
  "kevinh.svg": kevinhSvg,
};

const ANGLES = [-45, -30, -15, 15, 30, 45];

function getFishAngle(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0x7fffffff;
  }
  return ANGLES[hash % ANGLES.length];
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  fish?: string;
  linkedin?: string;
  website?: string;
}

interface TeamSectionProps {
  teamMembers: TeamMember[];
  id?: string;
}

const TeamSection: React.FC<TeamSectionProps> = ({ teamMembers, id }) => {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.5;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const updateScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setScrollLeft(scrollLeft);
      setMaxScroll(scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      updateScrollState();
      container.addEventListener("scroll", updateScrollState);
      return () => container.removeEventListener("scroll", updateScrollState);
    }
  }, []);

  return (
    <section
      id={id}
      className="w-full h-full flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl text-center mb-8 md:mb-12 px-4 md:px-0"
      >
        <h2 className="text-5xl md:text-7xl font-bold mb-4 text-white font-dfvn">
          Meet the Team
        </h2>
        <p className="text-lg md:text-2xl text-white">
          The passionate individuals driving {constants.hackathonName} forward. Our team is
          dedicated to creating an unforgettable hackathon experience for all
          participants.
        </p>
      </motion.div>

      {/* Scrollable container with arrows */}
      <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8">
        {/* Left scroll button */}
        <button
          onClick={() => handleScroll("left")}
          className={`absolute left-2 top-1/2 -translate-y-1/2 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10 ${
            scrollLeft <= 0
              ? "opacity-50 cursor-default"
              : "opacity-100 hover:bg-white/20 bg-white/10"
          }`}
          aria-label="Scroll left"
          disabled={scrollLeft <= 0}
        >
          <IconChevronLeft className="text-white h-6 w-6" />
        </button>

        {/* Scrollable team members grid */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide pb-4 w-full"
          onScroll={updateScrollState}
        >
          <div className="grid grid-flow-col grid-rows-2 auto-cols-min gap-x-2 gap-y-4 md:gap-x-4 py-5 w-max mx-auto">
            {teamMembers.map(member => (
              <div
                key={member.name}
                className="relative flex flex-col items-center text-center w-44 md:w-56"
              >
                {member.fish && fishMap[member.fish] && (
                  <Image
                    src={fishMap[member.fish]}
                    alt=""
                    width={48}
                    height={36}
                    className="absolute top-0 right-0 w-12 h-auto z-10 pointer-events-none"
                    style={{ transform: `rotate(${getFishAngle(member.name)}deg)` }}
                  />
                )}
                <motion.div
                  className="w-32 h-32 md:w-40 md:h-40 mb-4 relative"
                  onMouseEnter={() =>
                    (member.linkedin || member.website) &&
                    setHoveredImage(member.name)
                  }
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  <MemberImage
                    src={member.image || "/images/default.webp"}
                    alt={member.name}
                    width={160}
                    height={160}
                    className={`rounded-md object-cover shadow-lg transition-all duration-300 ${
                      hoveredImage === member.name &&
                      (member.linkedin || member.website)
                        ? "brightness-50"
                        : "brightness-100"
                    }`}
                  />
                  {(member.linkedin || member.website) && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center space-x-4 transition-all duration-300 ${
                        hoveredImage === member.name
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name}'s LinkedIn`}
                          className="text-white hover:text-gray-300 transition-colors duration-200 bg-black/50 rounded-full p-2"
                        >
                          <IconBrandLinkedin size={24} />
                        </a>
                      )}
                      {member.website && (
                        <a
                          href={member.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name}'s Website`}
                          className="text-white hover:text-gray-300 transition-colors duration-200 bg-black/50 rounded-full p-2"
                        >
                          <IconWorld size={24} />
                        </a>
                      )}
                    </div>
                  )}
                </motion.div>
                <h3 className="text-lg md:text-xl font-semibold text-white">
                  {member.name}
                </h3>
                <p className="text-gray-300">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => handleScroll("right")}
          className={`absolute right-2 top-1/2 -translate-y-1/2 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10 ${
            scrollLeft >= maxScroll - 1
              ? "opacity-50 cursor-default"
              : "opacity-100 hover:bg-white/20 bg-white/10"
          }`}
          aria-label="Scroll right"
          disabled={scrollLeft >= maxScroll}
        >
          <IconChevronRight className="text-white h-6 w-6" />
        </button>
      </div>
    </section>
  );
};

export default TeamSection;
