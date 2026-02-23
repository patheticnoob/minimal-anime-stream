import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-16 border-t border-white/10 px-6 md:px-10 py-10 text-center"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        <p className="text-white/80 text-sm leading-relaxed">
          <span className="font-semibold text-white">GojoStream</span> stands as a premier destination for free anime streaming, offering unlimited access to the latest and greatest anime series, movies, and OVAs — all without registration. Boasting an extensive library powered by multiple streaming sources and cutting-edge features like sub/dub switching, watch history, and a fully customizable viewing experience, GojoStream delivers the ultimate free anime streaming experience you've been searching for.
        </p>
        <p className="text-white/40 text-xs leading-relaxed">
          This site does not store any files on our server. We only index and provide links to media hosted on third-party services. All content is sourced from publicly available third-party platforms. GojoStream is not responsible for the accuracy, compliance, copyright, legality, decency, or any other aspect of the content of other linked sites.
        </p>
        <p className="text-white/20 text-xs">© {new Date().getFullYear()} GojoStream. All rights reserved.</p>
      </div>
    </motion.footer>
  );
}
