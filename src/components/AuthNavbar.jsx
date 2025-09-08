import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from './Container';
import Button from './Button';

const AuthNavbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <Container className="py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg">Enterprise HRMS</span>
        </Link>
        <Link to="/">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </Container>
    </header>
  );
};

export default AuthNavbar;