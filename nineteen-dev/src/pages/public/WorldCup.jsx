import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import WorldCupBracket from '../../components/WorldCupBracket';
import WorldCupSchedule from '../../components/WorldCupSchedule';

const WorldCup = () => {
  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <SEO title="World Cup 2026 Bracket | nineteen.dev" />
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 bg-white">
        <WorldCupBracket />
        <div className="mt-12">
          <WorldCupSchedule />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WorldCup;
