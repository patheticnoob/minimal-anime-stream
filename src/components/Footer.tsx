import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

export function Footer() {
  const { theme } = useTheme();
  const isNothing = theme === "nothing";

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`mt-16 border-t px-6 md:px-10 py-10 text-center ${
        isNothing
          ? "border-[var(--nothing-border)]"
          : "border-white/10"
      }`}
    >
      <div className="max-w-3xl mx-auto space-y-4">
        <p className={`text-sm leading-relaxed ${isNothing ? "text-[var(--nothing-fg)]" : "text-white/80"}`}>
          <span className={`font-semibold ${isNothing ? "text-[var(--nothing-accent)]" : "text-white"}`}>GojoStream</span>{" "}
          stands as a premier destination for free anime streaming, offering unlimited access to the latest and greatest anime series, movies, and OVAs — all without registration. Boasting an extensive library powered by multiple streaming sources and cutting-edge features like sub/dub switching, watch history, and a fully customizable viewing experience, GojoStream delivers the ultimate free anime streaming experience you've been searching for.
        </p>
        <p className={`text-xs leading-relaxed ${isNothing ? "text-[var(--nothing-gray-4)]" : "text-white/40"}`}>
          This site does not store any files on our server. We only index and provide links to media hosted on third-party services. All content is sourced from publicly available third-party platforms. GojoStream is not responsible for the accuracy, compliance, copyright, legality, decency, or any other aspect of the content of other linked sites.
        </p>
        <p className={`text-xs ${isNothing ? "text-[var(--nothing-gray-5)]" : "text-white/20"}`}>© {new Date().getFullYear()} GojoStream. All rights reserved.</p>
      </div>
    </motion.footer>
  );
}