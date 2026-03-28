import { motion } from "framer-motion";

const FooterSection = () => {
  return (
    <footer className="py-24 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-xl italic text-muted-foreground"
        >
          Blank Space
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-body text-xs tracking-[0.2em] text-muted-foreground uppercase"
        >
          The art of nothing — {new Date().getFullYear()}
        </motion.p>
      </div>
    </footer>
  );
};

export default FooterSection;
