// SuccessModal.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SuccessModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="min-h-full fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-lg"
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center border border-gray-100"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto mb-6 flex items-center justify-center"
            >
              <Image
                src="/check.png"
                width={150}
                height={150}
                alt="check"
                className="object-contain"
              />
            </motion.div>

            <h2 className="text-3xl font-bold text-black mb-2">Success!</h2>

            <button
              onClick={onClose}
              className="w-full border bg-red-700 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95"
            >
              Got it, thanks!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}