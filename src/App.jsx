import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import './App.css'
import { Outlet } from 'react-router-dom'

const theme = createTheme({
  /** Set the primary color */
  primaryColor: 'violet',

  /** Define custom color palette */
  colors: {
    'dark-purple': [
      '#F3E8FD',
      '#E9D8FD',
      '#D8B4FE',
      '#C084FC',
      '#A855F7',
      '#9333EA',
      '#7E22CE',
      '#6B21A8',
      '#581C87',
      '#4C1D95'
    ],
    'black': [
      '#000000', '#0A0A0A', '#141414', '#1E1E1E', '#282828',
      '#323232', '#3C3C3C', '#464646', '#505050', '#5A5A5A'
    ]
  },

  /** Apply dark mode styles */
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',

  /** Enable dark mode */
  colorScheme: 'dark',

  /** Override default styles */
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <div className="min-h-screen bg-app-dark">
        <Outlet />
      </div>
    </MantineProvider>
  )
}

export default App
