"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useBreakpoint } from "@/hooks/useMediaQuery";
import { IconX } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useHash } from "@/hooks/useURLHash";

interface ClickableItemProps {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  img: string;
  size: number;
  id: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

const ClickableItem: React.FC<ClickableItemProps> = ({
  children,
  top, 
  left, 
  right, 
  bottom, 
  size, 
  img, 
  id,
  disabled = false 
}) => {
  const urlId = useHash();
  const [showModal, setShowModal] = useState(false || urlId === id);
  const { isMobile, isTablet } = useBreakpoint();

  function handleModalClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (event.target === event.currentTarget) {
      setShowModal(false);
    }
  }

  function handleImageClick() {
    if (!disabled) {
      setShowModal(true);
    }
  }

  function handleESC(event: KeyboardEvent) {
    if (event.code === "Escape") {
      setShowModal(false);
    }
  }

  useEffect(() => {
    if (urlId === id) setShowModal(true);
  }, [urlId, id])

  useEffect(() => {
    if (showModal) {
      window.addEventListener("keydown", handleESC);
    }

    return () => window.removeEventListener("keydown", handleESC);
  }, [showModal]);

  // Return only the children and and id
  if (isMobile || isTablet) {
    return (
      <>
        <span className="invisible absolute" id={id}></span>
        {children}
      </>
    );
  }

  return (
    <>
      {showModal && (
        <div 
          className="z-10 fixed top-0 bottom-0 left-0 right-0 bg-opacity-50 bg-black flex flex-col justify-center items-center pt-20 pb-10 px-10"
          onClick={handleModalClick}
        >
          <div className="w-full p-2">
            <IconX
              onClick={() => setShowModal(false)}
              className="text-white cursor-pointer hidden lg:block float-end"
            />
          </div>
          {children}
        </div>
      )}
      <motion.div 
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        style={{ top: `${top}%`, left: `${left}%`, right: `${right}%`, bottom: `${bottom}%`, width: `${size}%`}}
        className="absolute h-auto cursor-pointer hidden lg:block"
      >
        <Image 
          width={1111}
          height={1090}
          src={img}
          alt=""
          onClick={handleImageClick}
        />
      </motion.div> 
    </>
  );
}

export default ClickableItem;
