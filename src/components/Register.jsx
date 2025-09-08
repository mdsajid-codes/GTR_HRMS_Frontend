import React from 'react';
import { Building2 } from 'lucide-react';
import Container from './Container';
import Button from './Button';
import { Link } from 'react-router-dom';

const Register = () => (
  <section id="register" className="py-20 bg-slate-50">
    <Container className="text-center">
      <h2 className="text-3xl font-bold">Register Your Company</h2>
      <p className="mt-3 text-sm opacity-70 max-w-xl mx-auto">
        Get started in minutes. Create your tenant, configure policies, and onboard your HR team securely.
      </p>
      <div className="mt-6 flex justify-center">
        <Link to="/register">
          <Button><Building2 className="h-5 w-5" /> Get Started</Button>
        </Link>
      </div>
    </Container>
  </section>
);

export default Register;

