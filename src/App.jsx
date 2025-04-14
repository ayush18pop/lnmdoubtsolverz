import { useState } from 'react'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'

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
  colorScheme: 'dark',

  /** Override default styles */
  components: {
    Card: {
      styles: (theme) => ({
        root: { 
          backgroundColor: theme.colors.dark[7],
          borderColor: theme.colors.dark[5],
          color: theme.colors.gray[0]
        }
      })
    },
    CardSection: {
      styles: (theme) => ({
        root: { 
          backgroundColor: theme.colors.dark[8],
          borderBottomColor: theme.colors.dark[5]
        }
      })
    },
    Paper: {
      styles: (theme) => ({
        root: { 
          backgroundColor: theme.colors.dark[7],
          color: theme.colors.gray[0]
        }
      }),
      defaultProps: {
        radius: 'md',
      }
    },
    Modal: {
      styles: (theme) => ({
        content: {
          backgroundColor: theme.colors.dark[7],
        },
        header: {
          backgroundColor: theme.colors.dark[7],
          color: theme.colors.gray[0]
        },
        title: {
          color: theme.colors.gray[0]
        },
        body: {
          color: theme.colors.gray[0],
          backgroundColor: theme.colors.dark[7]
        },
        overlay: {
          backgroundColor: `rgba(${theme.colors.dark[9]}, 0.75)`
        }
      })
    },
    TextInput: {
      styles: (theme) => ({
        input: {
          backgroundColor: theme.colors.dark[6],
          borderColor: theme.colors.dark[4],
          color: theme.colors.gray[0],
          '&::placeholder': {
            color: theme.colors.gray[5]
          }
        },
        label: {
          color: theme.colors.gray[0]
        },
        error: {
          color: theme.colors.red[6]
        }
      })
    },
    Select: {
      styles: (theme) => ({
        input: {
          backgroundColor: theme.colors.dark[6],
          borderColor: theme.colors.dark[4],
          color: theme.colors.gray[0]
        },
        label: {
          color: theme.colors.gray[0]
        },
        item: {
          '&[data-selected]': {
            backgroundColor: theme.colors.dark[5],
            color: theme.colors.gray[0]
          },
          '&[data-hovered]': {
            backgroundColor: theme.colors.dark[4]
          },
          color: theme.colors.gray[0]
        },
        dropdown: {
          backgroundColor: theme.colors.dark[7],
          borderColor: theme.colors.dark[4]
        }
      })
    },
    Textarea: {
      styles: (theme) => ({
        input: {
          backgroundColor: theme.colors.dark[6],
          borderColor: theme.colors.dark[4],
          color: theme.colors.gray[0],
          '&::placeholder': {
            color: theme.colors.gray[5]
          }
        },
        label: {
          color: theme.colors.gray[0]
        }
      })
    },
    FileInput: {
      styles: (theme) => ({
        input: {
          backgroundColor: theme.colors.dark[6],
          borderColor: theme.colors.dark[4],
          color: theme.colors.gray[0]
        },
        label: {
          color: theme.colors.gray[0]
        }
      })
    },
    Tabs: {
      styles: (theme) => ({
        tab: {
          color: theme.colors.gray[0],
          '&[data-active]': {
            color: theme.colors.gray[0]
          }
        },
        panel: {
          color: theme.colors.gray[0]
        },
        tabsList: {
          borderColor: theme.colors.dark[5]
        }
      })
    },
    Text: {
      styles: (theme) => ({
        root: {
          color: theme.colors.gray[0],
          '&[data-dimmed="true"]': {
            color: theme.colors.gray[5]
          }
        }
      })
    },
    Title: {
      styles: (theme) => ({
        root: {
          color: theme.colors.gray[0]
        }
      })
    },
    Button: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
    },
    PasswordInput: {
      styles: (theme) => ({
        input: {
          backgroundColor: theme.colors.dark[6],
          borderColor: theme.colors.dark[4],
          color: theme.colors.gray[0],
          '&::placeholder': {
            color: theme.colors.gray[5]
          }
        },
        label: {
          color: theme.colors.gray[0]
        },
        error: {
          color: theme.colors.red[6]
        }
      })
    },
    Checkbox: {
      styles: (theme) => ({
        input: {
          backgroundColor: theme.colors.dark[6],
          borderColor: theme.colors.dark[4],
          color: theme.colors.gray[0],
          '&::placeholder': {
            color: theme.colors.gray[5]
          }
        },
        label: {
          color: theme.colors.gray[0]
        }
      })
    }
  }
});


function App() {
  const [count, setCount] = useState(0)

  return (
    <MantineProvider theme={theme} colorScheme="dark" forceDarkAriaAttributes>
      
      <div >
        <Outlet />
      </div>
    </MantineProvider>
  )
}

export default App
