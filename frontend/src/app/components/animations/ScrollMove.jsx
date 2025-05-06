import { motion, useScroll, useTransform, cubicBezier } from "framer-motion";
import { useRef } from "react";

export default function ScrollMove({
  children,
  value = 80,
  delay = 0.5,
  direction = "left",
}) {

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 100],
    [-100, 0],
    { ease: cubicBezier(0.17, 0.67, 0.83, 0.67) }
  );

  return (
    <motion.div ref={ref} style={{ x }}>
      {children}
    </motion.div>
  );
}
