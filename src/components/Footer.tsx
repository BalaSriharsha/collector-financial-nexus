
import { Link } from "react-router-dom";
import { Coins, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-collector-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-gradient rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-playfair font-bold">Collector</h1>
            </div>
            <p className="text-gray-300 text-sm">
              Ancient wisdom meets modern finance. Master your financial empire with precision and elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-playfair font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/features" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Features
              </Link>
              <Link to="/pricing" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Pricing
              </Link>
              <Link to="/forum" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Forum
              </Link>
              <Link to="/careers" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Careers
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-playfair font-semibold">Support</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Help Center
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Documentation
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-playfair font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-collector-gold" />
                <span className="text-gray-300 text-sm">support@collector.app</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-collector-gold" />
                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-collector-gold" />
                <span className="text-gray-300 text-sm">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Collector. All rights reserved. Ancient wisdom, modern solutions.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
