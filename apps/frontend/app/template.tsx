'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      id="page-transition-wrapper"
      key={pathname}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.05, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 0.5 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
