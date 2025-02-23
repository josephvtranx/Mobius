import React from 'react';
import Header from './components/Header';
import SideNav from './components/SideNav';
import Mcal from './components/MCal';
import './css/index.css';

function App() {
  return (
    <div className="App">
      <Header />
      <SideNav />
      <Mcal />
      {/* Other content/components */}
    </div>
  );
}

export default App;

