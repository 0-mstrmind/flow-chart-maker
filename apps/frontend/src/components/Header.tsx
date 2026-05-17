import { Workflow } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/20">
          <Workflow className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-100">
            FlowMind AI
          </h1>
          <p className="text-xs text-zinc-400">Diagram Generator</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
