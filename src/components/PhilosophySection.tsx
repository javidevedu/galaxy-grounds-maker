import { motion } from "framer-motion";

const quotes = [
  { text: "Less, but better.", author: "Dieter Rams" },
  { text: "Space is the breath of art.", author: "Frank Lloyd Wright" },
  { text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
];

const PhilosophySection = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-muted-foreground font-body text-sm tracking-[0.3em] uppercase mb-16 text-center"
        >
          Philosophy
        </motion.p>

        <div className="space-y-24">
          {quotes.map((quote, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className={`flex flex-col ${i % 2 === 0 ? 'items-start' : 'items-end'}`}
            >
              <blockquote className={`max-w-2xl ${i % 2 === 0 ? 'text-left' : 'text-right'}`}>
                <p className="font-display text-2xl md:text-4xl italic leading-snug mb-4">
                  "{quote.text}"
                </p>
                <cite className="text-muted-foreground font-body text-sm tracking-widest uppercase not-italic">
                  — {quote.author}
                </cite>
              </blockquote>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
