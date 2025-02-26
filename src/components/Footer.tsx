import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800/50 backdrop-blur-sm mt-auto border-t border-gray-700/30">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Campus Events. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0">
            <nav className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;