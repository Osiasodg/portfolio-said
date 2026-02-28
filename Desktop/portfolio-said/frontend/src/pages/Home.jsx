// useEffect n'est pas nécessaire ici, useTracking s'en charge
// import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Experience from '../components/Experience';
import Contact from '../components/Contact';
import { useTracking } from '../hooks/useTracking';

const Home = () => {
  useTracking(); // Active le suivi des visites

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Skills />
      <Projects />
      <Experience />
      <Contact />
      <footer className="bg-slate-900 border-t border-slate-700 py-6 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} Saïd Osias OUEDRAOGO · Data Analyst
      </footer>
    </div>
  );
};

export default Home;