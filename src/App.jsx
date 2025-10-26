import React from 'react';
// 🚨 Ensure the react-router-dom import is correct
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 🚨 Ensure the path to your component is correct
import AirForShareUI from './components/AirForShareUI'; 
import './App.css'; 

function App() {
    return (
        <Router>
        <div className="App">
        <Routes>
        <Route path="/" element={<AirForShareUI />} />
        <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
        </div>
        </Router>
    );
}

export default App;