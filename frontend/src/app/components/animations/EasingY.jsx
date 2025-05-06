import { motion } from "framer-motion";

export default function EasingY({
  children,
  value = 40,
  delay = 0.5,
  direction = "up",
  cls = ""
}) {
  const y = direction === "up" ? -value : value;
  return (
    <motion.div
      className={cls}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          delay: delay,
          bounce: 0.5,
          ease: "easeOut",
        },
      }}
      viewport={{ once: true }}
      initial={{ opacity: 0, y }}
    >
      {children}
    </motion.div>
  );
}
