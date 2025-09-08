import React from 'react';
import Container from './Container';

const Footer = () => (
  <footer className="border-t py-10 text-center text-sm opacity-70">
    <Container>
      <p>© {new Date().getFullYear()} Enterprise HRMS. All rights reserved.</p>
    </Container>
  </footer>
);

export default Footer;

