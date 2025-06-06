
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
              <div className="w-10 h-10 bg-navy-800 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-playfair font-bold">Vittas</h1>
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

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-playfair font-semibold">Legal</h3>
            <div className="space-y-2">
              <Link to="/privacy-policy" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/cancellation-refund" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Cancellation & Refund
              </Link>
              <Link to="/shipping-delivery" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Shipping & Delivery
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-playfair font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-collector-gold" />
                <span className="text-gray-300 text-sm">support@vittas.app</span>
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
            © 2024 Vittas. All rights reserved. Ancient wisdom, modern solutions.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
