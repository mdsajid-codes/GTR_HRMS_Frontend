import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, Mail, Building2, LogIn } from 'lucide-react';
import Container from './Container';
import Button from './Button';
import { Link, useNavigate } from 'react-router-dom';

const navLinks = [
  { title: "Demo", href: "#demo" },
  { title: "Features", href: "#features" },
  { title: "Register", href: "#register" },
  { title: "Pricing", href: "#pricing" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  const btnLogout =()=>{
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    localStorage.removeItem('tenantId')
    navigate("/login");
  }

  const menuVariants = {
    hidden: {
      x: '100%',
      transition: {
        type: 'tween',
        duration: 0.3,
      },
    },
    visible: {
      x: 0,
      transition: {
        type: 'tween',
        duration: 0.3,
      },
    },
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <Container className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg">Enterprise HRMS</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <a key={link.title} href={link.href} className="hover:text-blue-600 transition-colors">
              {link.title}
            </a>
          ))}
        </nav>
        <div className="hidden sm:flex items-center gap-3">
          <Button variant="ghost"><Mail className="h-4 w-4" /> Contact</Button>
          <Button onClick={btnLogout}><LogIn className='h-4 w-4' />{localStorage.getItem('token') ? "Logout" : "Login"}</Button>
          <Link to="/register">
            <Button><Building2 className="h-4 w-4" /> Register</Button>
          </Link>
        </div>
        <button className="md:hidden" onClick={toggleMenu}>
          <Menu className="h-6 w-6" />
        </button>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 bg-white p-6 md:hidden"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-lg">Enterprise HRMS</span>
              </div>
              <button onClick={toggleMenu}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  onClick={toggleMenu}
                  className="text-lg font-medium hover:text-blue-600 transition-colors"
                >
                  {link.title}
                </a>
              ))}
              <div className="mt-4 border-t pt-4 flex flex-col gap-3">
                <Button variant="ghost"><Mail className="h-4 w-4" /> Contact</Button>
                <Link to="/login" onClick={toggleMenu}>
                  <Button className="w-full justify-center"><LogIn className="h-4 w-4" />Login</Button>
                </Link>
                <Link to="/register" onClick={toggleMenu}>
                  <Button className="w-full justify-center"><Building2 className="h-4 w-4" />Register</Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;