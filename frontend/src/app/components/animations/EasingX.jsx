import { motion } from "framer-motion";

export default function EasingX({
  children,
  value = 40,
  delay = 0.4,
  direction = "left",
  duration = 0.5,
}) {
  const x = direction === "left" ? -value : value;
  return (
    <motion.div
      whileInView={{
        opacity: 1,
        x: 0,
        transition: {
          duration,
          delay: delay,
          bounce: 0.5,
        },
      }}
      viewport={{ once: true }}
      initial={{ opacity: 0, x }}
    >
      {children}
    </motion.div>
  );
}
