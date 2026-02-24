import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = ['Accueil', 'À propos', 'Compétences', 'Projets', 'Expérience', 'Contact'];

  return (
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm z-50 border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-400">Saïd Osias</span>
        
        {/* Menu Desktop */}
        <ul className="hidden md:flex gap-6">
          {links.map(link => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase().replace(' ', '-')}`}
                className="text-slate-300 hover:text-blue-400 transition-colors text-sm"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* Bouton Menu Mobile */}
        <button
          className="md:hidden text-slate-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 px-4 py-3">
          {links.map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(' ', '-')}`}
              className="block py-2 text-slate-300 hover:text-blue-400"
              onClick={() => setIsOpen(false)}
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;