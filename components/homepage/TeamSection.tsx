"use client";

import { motion } from "framer-motion";
import MemberImage from "./MemberImage";
import {
  IconBrandLinkedin,
  IconWorld,
  IconChevronLeft,
  IconChevronRight,
  IconFlower,
} from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  website?: string;
}

interface TeamSectionProps {
  teamMembers: TeamMember[];
  id?: string;
}

function randomFlowerStyle(): string {
  const colors = [
    "text-red-500",
    "text-blue-500",
    "text-yellow-500",
    "text-orange-500",
  ];

  const offsets = ["0", "1", "2", "3", "4"];

  const rotations = [
    "rotate-0",
    "rotate-6",
    "rotate-12",
    "rotate-45",
    "-rotate-6",
    "-rotate-12",
    "-rotate-45",
  ];

  const corners = [
    (offset: string) => `top-${offset} left-${offset}`,
    (offset: string) => `top-${offset} right-${offset}`,
    (offset: string) => `bottom-${offset} left-${offset}`,
    (offset: string) => `bottom-${offset} right-${offset}`,
  ];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomOffset = offsets[Math.floor(Math.random() * offsets.length)];
  const randomCorner = corners[Math.floor(Math.random() * corners.length)];
  const randomRotation =
    rotations[Math.floor(Math.random() * rotations.length)];

  return `absolute z-10 ${randomCorner(randomOffset)} ${randomColor} ${randomRotation}`;
}

const TeamSection: React.FC<TeamSectionProps> = ({ teamMembers, id }) => {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [flowerStyles] = useState(() => {
    return teamMembers.map(randomFlowerStyle);
  })

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
      className="w-full h-full py-16 flex flex-col items-center justify-center bg-[#7a4a21]"
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
          The passionate individuals driving HackKU25 forward. Our team is
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
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className="flex flex-col items-center text-center w-44 md:w-56"
              >
                <motion.div
                  className="w-32 h-32 md:w-40 md:h-40 mb-4 relative"
                  onMouseEnter={() =>
                    (member.linkedin || member.website) &&
                    setHoveredImage(member.name)
                  }
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  <IconFlower size="3em" className={flowerStyles[index]}/>
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
