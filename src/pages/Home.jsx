import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/feed');  // Redirects to /feed on component mount
    }, [navigate]);

    return (
        <div className="w-full py-8">
            <Navbar />
            Redirecting...
        </div>
    );
}

export default Home;
