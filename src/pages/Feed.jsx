import React from 'react'
import Navbar  from '../components/Navbar.jsx'
import { useSelector } from 'react-redux'

function Feed() {

  return (
    <div className="flex">
      <Navbar />
      <div className="flex-1 p-8 ml-[300px]">
        <h1 className="text-2xl font-bold mb-4">Feed</h1>
        {/* Add your feed content here */}
        <div>
          Feed content will go here
        </div>
      </div>
    </div>
  )
}

export default Feed