import { motion } from "framer-motion";

const GallerySection = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-muted-foreground font-body text-sm tracking-[0.3em] uppercase mb-16 text-center"
        >
          Compositijdtyons
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: item * 0.1 }}
              className="bg-background aspect-square flex items-center justify-center group cursor-pointer"
            >
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <motion.div
                  className="w-16 h-16 border border-foreground/20 group-hover:border-foreground/60 transition-colors duration-700"
                  whileHover={{ rotate: 45, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                />
                <span className="absolute bottom-6 left-6 text-muted-foreground font-body text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  NO. {String(item).padStart(2, '0')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
