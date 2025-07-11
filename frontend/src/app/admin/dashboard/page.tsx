"use client";

import React from "react";
import Image from "next/image";

export default function AdminPosterPage() {
  return (
    <div className="relative w-screen h-screen min-h-screen bg-black">
      <Image
        src="/assets/admin_poster.jpg"
        alt="Luxoro Admin Dashboard Poster"
        fill
        className="object-cover w-full h-full"
        priority
      />
    </div>
  );
}
