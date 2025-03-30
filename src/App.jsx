import { useState } from 'react'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Outlet } from 'react-router-dom'

const theme = createTheme({
  primaryColor: 'violet',
  colors: {
    'ocean-blue': [
      '#7AD1DD',
      '#5FCCDB',
      '#44CADC',
      '#2AC9DE',
      '#1AC2D9',
      '#11B7CD',
      '#09ADC3',
      '#0E99AC',
      '#128797',
      '#147885'
    ]
  }
});

function App() {
  const [count, setCount] = useState(0)

  return (
    <MantineProvider theme={theme}>
      <Outlet />
    </MantineProvider>
  )
}

export default App
