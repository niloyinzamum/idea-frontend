
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Menu, X } from "lucide-react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Idea Hub
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-gray-800 hover:text-blue-600 transition-colors duration-300 font-medium">
              About
            </Link>
            <Link to="/dashboard" className="text-gray-800 hover:text-blue-600 transition-colors duration-300 font-medium">
              Dashboard
            </Link>
            <Link to="/profile" className="text-gray-800 hover:text-blue-600 transition-colors duration-300 font-medium">
              Profile
            </Link>
            <Link to="/privacy" className="text-gray-800 hover:text-blue-600 transition-colors duration-300 font-medium">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-800 hover:text-blue-600 transition-colors duration-300 font-medium">
              Terms
            </Link>
          </div>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/signin">
              <Button variant="ghost" className="text-gray-800 hover:text-blue-600 hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-800 hover:bg-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20">
            <div className="flex flex-col space-y-4 mt-4">
              <Link 
                to="/about" 
                className="text-gray-800 hover:text-blue-600 transition-colors duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/dashboard" 
                className="text-gray-800 hover:text-blue-600 transition-colors duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className="text-gray-800 hover:text-blue-600 transition-colors duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link 
                to="/privacy" 
                className="text-gray-800 hover:text-blue-600 transition-colors duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Privacy
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-800 hover:text-blue-600 transition-colors duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Terms
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
                <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-gray-800 hover:text-blue-600 hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
