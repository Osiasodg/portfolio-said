import { downloadCV } from '../services/api';

const Hero = () => {
  return (
    <section id="accueil" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
      <div className="text-center px-4 max-w-3xl mx-auto">
        <div className="w-32 h-32 rounded-full bg-blue-500 mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-white">
          SO
        </div>
        <p className="text-blue-400 text-lg mb-2">Bonjour, je suis</p>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Saïd Osias OUEDRAOGO
        </h1>
        <h2 className="text-xl md:text-2xl text-blue-300 mb-6">
          Data Analyst · Développeur Data Python-SQL
        </h2>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
          Ingénieur en Génie Informatique, je transforme des données brutes en informations 
          exploitables pour optimiser les processus et aider à la décision.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="#projets"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Voir mes projets
          </a>
          <a
            href={downloadCV()}
            download
            className="border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-slate-900 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Télécharger mon CV
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;