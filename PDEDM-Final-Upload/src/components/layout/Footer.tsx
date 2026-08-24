export function Footer() {
  return (
    <footer className="w-full py-8 mt-auto flex justify-center px-4">
      <div className="glass-card rounded-2xl px-8 py-6 flex flex-col items-center justify-center text-center space-y-1.5 text-sm text-muted-foreground w-full max-w-3xl shadow-xl">
        <p className="font-bold text-foreground tracking-widest text-xs uppercase mb-1">
          Founder <span className="mx-2 text-blue-500">•</span> James Sonani
        </p>
        <p className="font-medium text-foreground/90">Gujarat, Bhavnagar, India</p>
        <p className="text-xs opacity-75">
          Studying in Class 11 PCM at <span className="text-emerald-500 font-medium">Vidyadhish-Vidyasankul</span>
        </p>
        <div className="pt-2">
          <a 
            href="mailto:jamessonani1020@gmail.com" 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-xs transition-colors hover:text-foreground text-muted-foreground font-medium"
          >
            jamessonani1020@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
