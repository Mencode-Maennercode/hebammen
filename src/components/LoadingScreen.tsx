'use client';

import { motion } from 'framer-motion';

const LOGO_URL = "https://static.wixstatic.com/media/446934_56e43f0c28704f46bb3b1b221dee9a3f~mv2.png/v1/fill/w_209,h_205,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/446934_56e43f0c28704f46bb3b1b221dee9a3f~mv2.png";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-white to-[#FDF8F5]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* Logo */}
        <img
          src={LOGO_URL}
          alt="Hebammen am Marienhospital"
          className="w-24 h-24 object-contain mb-8"
        />

        {/* Animated spinner */}
        <div className="relative h-12 w-12 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-[#8B5A6B]/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8B5A6B] animate-spin" />
        </div>

        <p className="text-[#8B5A6B] font-medium text-lg">
          Inhalte werden geladen ...
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Einen Moment bitte
        </p>
      </motion.div>
    </div>
  );
}
