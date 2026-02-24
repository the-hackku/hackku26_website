"use client"

import type { TeamMember } from "@/components/homepage/TeamSection";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import constants from "@/constants";
import { useSession } from "next-auth/react";
import FAQSection from "@/components/homepage/FAQSection";
import AboutSection from "@/components/homepage/AboutSection";
import TeamSection from "@/components/homepage/TeamSection";
// import AllSvg from "@/components/homepage/svg/AllSvg";

import { IconBrandDiscord } from "@tabler/icons-react";
import ClickableItem from "@/components/homepage/ClickableItem";

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

  const faqs = [
    {
      question: "What's a hackathon?",
      answer:
        "A hackathon is an event where individuals or teams come together to brainstorm, design, and build projects. It provides an environment to learn new skills, tackle real-world challenges, and create impactful solutions, with opportunities to network and compete for prizes!",
    },
    {
      question: "What should I bring?",
      answer:
        "Bring a laptop, charger, and any hardware you plan to use. We also recommend bringing a change of clothes and toiletries.",
    },
    {
      question: "Who can participate?",
      answer:
        "Current students are welcome to participate. No prior experience is necessary! All High school students will require a chaperone.",
    },
    {
      question: "Is there a cost to attend?",
      answer:
        "No, HackKU is free to attend! We provide meals, swag, and resources for all participants.",
    },
    {
      question: "Can I participate remotely?",
      answer:
        "No, HackKU is an in-person event. We believe that the best experience comes from being on-site, collaborating with others, and engaging in the full hackathon experience.",
    },
    {
      question: "Do you offer travel reimbursements?",
      answer: (
        <>
          Yes! We offer travel reimbursements for participants who are traveling
          from outside of Lawrence, KS.
        </>
      ),
    },
  ];

  const previousEvents = [
    {
      name: "HackKU 2021",
      image: "/images/prev/2021.png",
      link: "https://hackku-2021.devpost.com/",
    },
    {
      name: "HackKU 2022",
      image: "/images/prev/2022.png",
      link: "https://hackku-2022.devpost.com/",
    },
    {
      name: "HackKU 2023",
      image: "/images/prev/2023.png",
      link: "https://hackku-2023.devpost.com/",
    },
    {
      name: "HackKU 2024",
      image: "/images/prev/2024.png",
      link: "https://hackku-2024.devpost.com/",
    },
    {
      name: "HackKU 2025",
      image: "/images/prev/2025.png",
      link: "https://hackku-2025.devpost.com/",
    },
  ];

  const teamMembers: TeamMember[] = [
    {
      name: "Delroy (Dellie) Cassell Wright III",
      role: "Director",
      linkedin: "https://www.linkedin.com/in/delroy-wright-440b35210/",
      website: "https://d3llie.tech",
      image: ""
    },
    {
      name: "Alivia Hanes",
      role: "Vice Director",
      linkedin: "https://www.linkedin.com/in/alivia-hanes",
      image: "",
    },
    {
      name: "Aiden Burke",
      role: "Logistics Co-Lead",
      linkedin: "https://www.linkedin.com/in/aidenhburke/",
      image: "",
    },
    {
      name: "Kelly Yee",
      role: "Logistics Co-Lead",
      linkedin: "http://linkedin.com/in/jiakyee",
      image: "",
    },
    {
      name: "Maral Bat",
      role: "Design Co-Lead",
      image: "",
    },
    {
      name: "Addison Ladish",
      role: "Marketing Co-Lead",
      image: "",
    },
    {
      name: "Lucía Ulate",
      role: "Outreach Co-Lead",
      linkedin: "https://www.linkedin.com/in/lucia-ulate-centeno",
      image: "",
    },
    {
      name: "Muhammad Ibrahim",
      role: "Sponsorship Co-Lead",
      linkedin: "https://www.linkedin.com/in/ibrahi12/",
      website: "https://www.ibrahim-muhm.com/",
      image: "",
    },
    {
      name: "Kenny Hong",
      role: "Sponsorship Co-Lead",
      linkedin: "https://www.linkedin.com/in/kennyhongcs/",
      image: "",
    },
    {
      name: "Josslyn T. Bui",
      role: "Sponsorship Co-Lead",
      image: "",
    },
    {
      name: "Kevinh Nguyen",
      role: "Food Lead",
      linkedin: "http://linkedin.com/in/kevinh-nguyen/",
      image: "",
    },
    {
      name: "Mark Horvath",
      role: "Interdisciplinary Involvement Co-Lead",
      linkedin: "https://www.linkedin.com/in/markandrewhorvath/",
      image: "",
    },
    {
      name: "Forest Denton",
      role: "Tech Co-Lead",
      linkedin: "https://www.linkedin.com/in/forest-denton-9076b2251/",
      image: ""
    },
    {
      name: "Aniketh Aatipamula",
      role: "Tech Co-Lead",
      linkedin: "https://www.linkedin.com/in/aaatipamula/",
      website: "https://aniketh.dev",
      image: "",
    },
  ];

  return (
    <div className="relative">
      <Image
        className="md:object-cover h-full"
        width={6000}
        height={12000}
        src="/images/homepage/nature.png"
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
              className="text-7xl md:text-8xl font-dfvn drop-shadow-lg"
              style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            >
              {constants.hackathonName}
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
      <ClickableItem 
        top={20}
        left={60}
        size={18}
        img="/images/homepage/sign.png"
      >
        <div className="-z-10 hidden lg:block absolute w-14 h-screen bg-[#79441d]"></div>
        <div
          className="
          w-full h-full bg-[#d2b891] overflow-y-clip
          lg:[clip-path:polygon(0%_0%,3%_19%,1%_34%,5%_53%,0%_64%,3%_83%,0%_100%,100%_100%,98%_85%,100%_68%,98%_54%,100%_38%,98%_20%,100%_0%)]
          "
        >
          <AboutSection previousEvents={previousEvents} id="about" />
        </div>
      </ClickableItem>


      <ClickableItem 
        top={39}
        left={9}
        size={30}
        img="/images/homepage/food_stall.png"
        disabled
      >
      </ClickableItem>

      <ClickableItem 
        top={47}
        left={22}
        size={14}
        img="/images/homepage/menu.png"
      >
        <div 
          style={{ border: "1rem solid #2e1708" }}
          className="w-full h-full bg-[#08301a] text-white lg:overflow-y-auto lg:overscroll-contain"
        >
          <FAQSection faqs={faqs} id="faq" />
        </div>
      </ClickableItem>

      <ClickableItem 
        top={51}
        right={0}
        size={27}
        img="/images/homepage/flower_bed.png"
      >
        <div 
          className="w-full h-full overflow-y-auto overscroll-contain"
        >
          <TeamSection teamMembers={teamMembers} id="team" />
        </div>
      </ClickableItem>
    </div>
  );
}
