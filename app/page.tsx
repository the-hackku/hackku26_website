"use client"

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import constants from "@/constants";
import { useSession } from "next-auth/react";
import FAQSection from "@/components/homepage/FAQSection";
import AboutSection from "@/components/homepage/AboutSection";
import TeamSection from "@/components/homepage/TeamSection";
import SponsorsSection from "@/components/homepage/SponsorsSection";

import { IconBrandDiscord } from "@tabler/icons-react";
import ClickableItem from "@/components/homepage/ClickableItem";

import { 
  faqs,
  teamMembers, 
  previousEvents,
  sponsorTiers,
  sponsors,
} from "@/data/homepage";

import nature from "@/assets/images/homepage/nature.png";
import natureFull from "@/assets/images/homepage/nature_full.png";
import mascot from "@/assets/images/homepage/mascot.png";
import signText from "@/assets/images/homepage/sign_text.png";
import foodStall from "@/assets/images/homepage/food_stall.png";
import menuUnreadable from "@/assets/images/homepage/menu_unreadable.png";
import flowerBed from "@/assets/images/homepage/flower_bed.png";
import cloudLogo from "@/assets/images/homepage/cloud_logo.png"
import fishComposite from "@/assets/images/fish/composite.svg";

export default function HomePage() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isMouseOver, setIsMouseOver] = useState(false);

  const { data: session } = useSession();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 15; // Adjust tilt sensitivity
    const y = ((clientY - top) / height - 0.5) * -15; // Adjust tilt sensitivity
    setTilt({ x, y });
    setIsMouseOver(true);
  };

  const resetTilt = () => {
    setTilt({ x: 0, y: 0 });
    setIsMouseOver(false);
  };

  return (
    <div className="relative pt-[25em] lg:pt-[10em] bg-[#c1e3fe]">
      {/* Desktop image */}
      <Image
        className="hidden lg:block lg:object-cover h-full"
        src={nature}
        alt="nature-bg"
      />

      {/* Mobile image */}
      <Image
        className="lg:hidden object-cover h-full"
        src={natureFull}
        alt="nature-bg"
      />

      <div className="absolute top-32 right-1/2 translate-x-1/2 text-white w-full lg:w-2/3">
        <section
          id="header"
          className="flex flex-col items-center justify-center text-center overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
        >
          <motion.div
            className="z-10 max-w-[80%] text-center md:max-w-[60%]"
            style={{
              transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
              transition: isMouseOver
                ? "transform .1s ease-out"
                : "transform 1s ease-out",
            }}
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl md:text-2xl drop-shadow-md"
              style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            >
              {constants.dates}
            </motion.p>

            {/* Event Title */}
            <motion.h1
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            >
              <Image
                src={cloudLogo}
                alt="cloud-logo"
              />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-3xl md:text-3xl drop-shadow-md"
              style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.6)" }}
            >
              @{" "}
              <Link
                href="https://maps.app.goo.gl/g2MHMwYqWsaYvLSL9"
                target="_blank"
                className="hover:underline md:text-white"
              >
                {constants.location.toUpperCase()}
              </Link>
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-6 flex flex-row justify-center gap-2"
            >
              {session ? (
                <Link href="/schedule">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 bg-green-600 rounded-full text-2xl text-white font-agency"
                  >
                    View Schedule
                  </motion.button>
                </Link>
              ) : (
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-3 bg-yellow-500 rounded-full text-2xl text-black font-agency"
                    >
                      Register Now
                    </motion.button>
                  </Link>
                )}

              <Link
                href={constants.discordInvite}
                target="_blank"
                className="ml-0"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 bg-blue-500 rounded-full text-2xl font-agency text-white flex items-center space-x-2"
                >
                  <span>Discord</span>
                  <IconBrandDiscord />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
          <span className="hidden lg:inline text-gray-500 pt-10">Click the signs and stands to learn more about {constants.hackathonName}!</span>
        </section>
      </div>

      {/* Mascot */}
      <ClickableItem
        top={25}
        left={44}
        size={11}
        img={mascot}
        id="mascot"
        disabled
      />

      {/* Sign */}
      <ClickableItem 
        top={25}
        left={61}
        size={18}
        img={signText}
        id="about"
      >
        <div className="-z-10 hidden lg:block absolute w-14 h-screen bg-[#79441d]"></div>
        <div
          className="
          w-full h-full bg-[#d2b891] lg:overflow-y-auto lg:overscroll-contain
          lg:[clip-path:polygon(0%_0%,3%_19%,1%_34%,5%_53%,0%_64%,3%_83%,0%_100%,100%_100%,98%_85%,100%_68%,98%_54%,100%_38%,98%_20%,100%_0%)]
          "
        >
          <AboutSection previousEvents={previousEvents} />
        </div>
      </ClickableItem>


      {/* Food Stall */}
      <ClickableItem 
        top={45}
        left={7}
        size={32}
        img={foodStall}
        id="#"
        disabled
      >
      </ClickableItem>

      {/* Chalkboard Menu */}
      <ClickableItem 
        top={52}
        left={22}
        size={16}
        img={menuUnreadable}
        id="faq"
      >
        <div 
          style={{ border: "1rem solid #2e1708" }}
          className="w-full h-full text-white lg:overflow-y-auto lg:overscroll-contain bg-[#08301a]"
        >
          <FAQSection faqs={faqs} />
        </div>
      </ClickableItem>

      {/* Flower bed */}
      <ClickableItem 
        top={57}
        right={0}
        size={27}
        img={flowerBed}
        id="sponsors"
      >
        <div 
          style={{ border: '1rem solid #b54938' }}
          className="w-full h-full lg:overflow-y-auto lg:overscroll-contain pt-10 bg-[#7a4a21]"
        >
          <SponsorsSection sponsors={sponsors} sponsorTiers={sponsorTiers} />
        </div>
      </ClickableItem>

      {/* Fishes */}
      <ClickableItem 
        bottom={0}
        size={100}
        img={fishComposite}
        id="team"
      >
        <div className="w-full h-full flex flex-col">
          <svg
            className="hidden lg:block w-full flex-shrink-0 h-14"
            viewBox="0 0 1200 56"
            preserveAspectRatio="none"
          >
            <path
              d="M0,56 C200,8 400,56 600,8 C800,56 1000,8 1200,56 L1200,56 L0,56 Z"
              fill="#5176ab"
            />
          </svg>
          <div className="w-full flex-1 lg:overflow-y-auto lg:overscroll-contain pt-10 bg-[#5176ab]">
            <TeamSection teamMembers={teamMembers} />
          </div>
        </div>
      </ClickableItem>
    </div>
  );
}
