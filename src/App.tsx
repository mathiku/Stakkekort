import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Map from './components/Map';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:combinedkId" element={<Map />} />
        <Route path="/" element={
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-gray-600">Applikationen skal åbnes fra tildelt link</p>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;