import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import WorldCupBracket from '../../components/WorldCupBracket';

const WorldCup = () => {
  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <SEO title="World Cup 2026 Bracket | nineteen.dev" />
      <Navbar />
      
      <main className="flex-grow pt-24 pb-0 bg-white">
        <WorldCupBracket />
      </main>

      <Footer />
    </div>
  );
};

export default WorldCup;
