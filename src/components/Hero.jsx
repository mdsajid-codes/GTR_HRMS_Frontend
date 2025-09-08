import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Building2 } from 'lucide-react';
import Container from './Container';
import Button from './Button';
import { Link } from 'react-router-dom';

const Hero = () => (
  <section id="demo" className="flex-1 flex items-center py-24 bg-gradient-to-r from-blue-50 to-white">
    <Container className="text-center">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight"
      >
        Empower Your Workforce at Enterprise Scale
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-6 text-lg opacity-70 max-w-3xl mx-auto"
      >
        From recruitment to payroll, simplify HR with our secure, compliant, and scalable HRMS. Request a demo or register your company today.
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button><PlayCircle className="h-5 w-5" /> Request Demo</Button>
        <Link to="/register">
          <Button variant="outline"><Building2 className="h-5 w-5" /> Register Company</Button>
        </Link>
      </motion.div>
    </Container>
  </section>
);

export default Hero;