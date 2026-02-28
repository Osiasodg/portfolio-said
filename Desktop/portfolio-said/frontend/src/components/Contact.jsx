import { useState, useEffect } from 'react';
import { getProfile } from '../services/api';
import { FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaGlobe, FaTwitter, FaInstagram } from 'react-icons/fa';


// Correspondance label → icône
const getIcon = (label) => {
  const l = label?.toLowerCase();
  if (l?.includes('email') || l?.includes('mail')) return <FaEnvelope size={28} />;
  if (l?.includes('téléphone') || l?.includes('phone') || l?.includes('tel')) return <FaPhone size={28} />;
  if (l?.includes('linkedin')) return <FaLinkedin size={28} />;
  if (l?.includes('github')) return <FaGithub size={28} />;
  if (l?.includes('twitter')) return <FaTwitter size={28} />;
  if (l?.includes('instagram')) return <FaInstagram size={28} />;
  return <FaGlobe size={28} />;
};

const Contact = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    getProfile().then(res => setContacts(res.data.contacts || [])).catch(console.error);
  }, []);

  return (
    <section id="contact" className="py-20 bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Me <span className="text-blue-400">Contacter</span>
        </h2>
        <p className="text-slate-400 mb-10">
          Disponible pour une alternance. N'hésitez pas à me contacter.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contacts.map((c, i) => (
            <a key={i} href={c.url}
              target={c.url?.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="bg-slate-800 p-6 rounded-xl hover:border hover:border-blue-400 transition-all block group">
              <div className="text-blue-400 flex justify-center mb-3 group-hover:scale-110 transition-transform">
                {getIcon(c.label)}
              </div>
              <p className="text-white font-semibold text-sm">{c.label}</p>
              <p className="text-slate-400 text-xs mt-1 truncate">{c.value}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;