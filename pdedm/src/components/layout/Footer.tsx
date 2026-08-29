export function Footer() {
  return (
    <footer className="w-full py-8 mt-auto flex justify-center px-4">
      <div className="border-2 border-foreground bg-background rounded-none px-8 py-6 flex flex-col items-center justify-center text-center space-y-1.5 text-sm text-muted-foreground w-full max-w-3xl shadow-none">
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
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-background border-2 border-foreground hover:bg-foreground hover:text-background text-xs transition-colors font-bold uppercase tracking-widest text-foreground"
          >
            [ jamessonani1020@gmail.com ]
          </a>
        </div>
      </div>
    </footer>
  );
}
