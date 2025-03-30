import React from 'react';
import Navbar from '../components/Navbar';

function PostDoubt() {
  return (
    <div className="flex">
      {/* Sidebar (Navbar) */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 py-8 ml-[250px] flex flex-col items-start">
        <h1 className="text-2xl font-bold mb-4 text-black">Post Your Doubt</h1>
        
        <div className="w-full">
          {/* Additional content goes here */}
        </div>
      </div>
    </div>
  );
}

export default PostDoubt;
