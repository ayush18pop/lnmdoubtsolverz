import React from 'react';
import Navbar from '../components/Navbar';
import { MantineProvider } from '@mantine/core';
import { Text } from '@mantine/core';
function Resources() {
    return (
        <MantineProvider theme={{ colorScheme: 'dark' }}>
        <div style={{ backgroundColor: '#1A1B1E', minHeight: '100vh', color: '#C1C2C5' }}>
          {/* Navbar */}
          <div>
            <Navbar />
          </div>
  
          {/* Main Content */}
          <div className=' flex-1 md:ml-[300px] p-4 flex flex-col items-center justify-center text-center'>
            <Text size="xl" weight={700} style={{ marginBottom: '10px' }}>
              🚀 Coming Soon!
            </Text>
            <Text  size="md" color="dimmed">
              Our Resource Hub is under development. Stay tuned for updates!
            </Text>
           
          </div>
        </div>
      </MantineProvider>
    );
}

export default Resources;
