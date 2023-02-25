import { motion } from "framer-motion";

const loaderVariants = {
  animate: {
    transition: {
      staggerChildren: 0.2,
      repeat: Infinity,
      repeatType: "loop",
      repeatDelay: 0.5,
    },
  },
};

const dotVariants = {
  initial: {
    y: "0%",
  },
  animate: {
    y: "100%",
  },
};

export default function Loader() {
  return (
    <motion.div
      className="loader"
      variants={loaderVariants}
      animate="animate"
    >
      <motion.span className="dot" variants={dotVariants}></motion.span>
      <motion.span className="dot" variants={dotVariants}></motion.span>
      <motion.span className="dot" variants={dotVariants}></motion.span>
    </motion.div>
  );
}