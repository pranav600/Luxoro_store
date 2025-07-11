"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// -------------------- Animation Variants --------------------

const textVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" as any },
  }),
};

const imageVariant = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: "easeOut" as any },
  },
};

const aboutVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.3, duration: 0.6, ease: "easeOut" as any },
  }),
};

// -------------------- BannerSection Component --------------------

const BannerSection = ({
  title,
  description,
  image,
  reverse = false,
  sectionRef,
  buttonHref = "#",
}: {
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
  sectionRef?: React.Ref<HTMLDivElement>;
  buttonHref?: string;
}) => {
  const imageRounded = reverse ? "rounded-r-full" : "rounded-l-full";

  return (
    <section
      ref={sectionRef}
      className={`w-full text-black font-mono flex flex-col md:flex-row overflow-hidden items-center ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Text */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-10 py-8 md:py-0">
        <motion.h1
          custom={0}
          variants={textVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl md:text-7xl text-black font-mono leading-tight mb-4 sm:mb-6"
        >
          {title}
        </motion.h1>

        <motion.p
          custom={1}
          variants={textVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-base sm:text-lg md:text-xl mb-6 sm:mb-10"
        >
          {description}
        </motion.p>
        <Link href={buttonHref} passHref>
  <button
    className="bg-black text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-neutral-800 transition duration-300 w-fit cursor-pointer"
  >
    Shop Now
  </button>
</Link>
      </div>

      {/* Image */}
      <motion.div
        variants={imageVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex-1 relative min-h-[220px] sm:min-h-[350px] md:min-h-[500px] overflow-hidden"
      >
        <Image
          src={image}
          alt="Banner Image"
          fill
          className={`object-cover object-center transition-transform duration-500 ${imageRounded}`}
          priority
        />
      </motion.div>
    </section>
  );
};

// -------------------- About Section Component --------------------

type AboutSectionProps = {
  sectionRef?: React.RefObject<HTMLDivElement | null>;
};

export function AboutSection({ sectionRef }: AboutSectionProps) {
  return (
    <section ref={sectionRef} className="w-full py-12 sm:py-30 px-4 sm:px-8 text-center bg-white">
      <motion.p
        custom={1}
        variants={aboutVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto text-black text-base sm:text-lg md:text-xl font-mono leading-relaxed"
      >
        We are a design-forward fashion brand committed to creating timeless
        collections that blend comfort, quality, and individuality. Our pieces
        are inspired by the rhythm of everyday life, aiming to empower modern
        self-expression through bold silhouettes, effortless essentials, and
        thoughtful craftsmanship. With every season, we invite you to discover
        who you are through what you wear.
      </motion.p>

      <motion.div
        custom={2}
        variants={aboutVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-6 space-y-2 text-gray-500 italic text-sm sm:text-base"
      >
        <p>
          "Fashion is the armor to survive the reality of everyday life." — Bill
          Cunningham
        </p>
        <p>
          "Style is a way to say who you are without having to speak." — Rachel
          Zoe
        </p>
      </motion.div>
    </section>
  );
}

// -------------------- Main Component --------------------

export default function Banner() {
  const aboutRef = React.useRef<HTMLDivElement>(null);

  const handleSeeCollection = () => {
    if (aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Hero Video Section */}
      <section className="relative w-full h-[800px] overflow-hidden m-0 p-0 bg-white">
        <video
          className="w-full h-full object-cover"
          src="/assets/advertisement.mp4"
          poster="/assets/Advertisement-poster.jpg"
          autoPlay
          muted
          loop
        >
          Sorry, your browser does not support embedded videos.
        </video>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-xl sm:text-2xl md:text-4xl text-white font-mono mb-4 sm:mb-6">
            2025
          </p>
          <button
            className="bg-white text-black px-4 py-3 text-lg font-medium rounded-full hover:bg-neutral-200 transition duration-300 cursor-pointer"
            onClick={handleSeeCollection}
          >
            See Collection
          </button>
        </motion.div>
      </section>

      {/* About + Banners */}
      <AboutSection 
      sectionRef={aboutRef} 
      />
      <BannerSection
        title="Royal Collection"
        description="Timeless elegance meets modern sophistication in the Royal Collection, crafted with luxurious fabrics and refined detail."
        image="/assets/royal.jpeg"
        reverse
        buttonHref="/user_category/royal"
      />
      <BannerSection
        title="Summer Collection"
        description="Lightweight fabrics, neutral tones and breathable fits for your perfect summer look."
        image="/assets/summer.jpeg"
        buttonHref="/user_category/summer"
      />
      <BannerSection
        title="Winter Collection"
        description="Bold layers, premium textures, and warm essentials designed to elevate your winter style."
        image="/assets/winter.jpeg"
        reverse
        buttonHref="/user_category/winter"
      />
      <BannerSection
        title="Accessories"
        description="Essential accessories that elevate your style — from sleek belts to bold socks and timeless fragrances."
        image="/assets/accessories.jpeg"
        buttonHref="/user_category/accessories"
      />
    </>
  );
}
