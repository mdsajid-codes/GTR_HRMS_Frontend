import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Register from '../components/Register';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import Pricing from '../components/Pricing';


const Home = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50 text-slate-900">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <Register />
                <Pricing />
                <Testimonials />
            </main>
            <Footer />
        </div>
    );
}

export default Home;
