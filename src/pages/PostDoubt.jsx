import { useState, useRef } from 'react';
import { 
  TextInput, 
  SegmentedControl, 
  Button, 
  Group, 
  Text, 
  useMantineTheme,
  Paper,
  Title,
  Textarea,
  Stack,
  Alert,
  Progress,
  Container,
  Select,
  MultiSelect,
  MantineProvider,
  
} from '@mantine/core';
import { Global } from '@emotion/react';

import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconCloudUpload, IconDownload, IconX, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Navbar from '../components/Navbar';

// Define your custom colors based on the provided scheme
const darkColors = {
  darkBg: '#1A1B1E',
  darkPaper: '#25262B',
  darkBorder: '#373A40',
  darkComponent: '#2C2E33',
  lightText: '#F8F9FA',
  dimmedText: '#C1C2C5',
  primaryPurple: '#3A1F73',
  primaryLight: '#7350F2',
  secondaryPurple: '#5B3FBF',
  darkBackground: '#222326',
  accentGreen: '#41BF54'
};

// Custom styles without createStyles
const customStyles = {
  wrapper: {
    position: 'relative',
    marginBottom: '1rem',
  },
  dropzone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: darkColors.darkBorder,
    borderRadius: '8px',
    backgroundColor: darkColors.darkComponent,
    padding: '20px',
    transition: 'border-color 0.3s ease',
    '&:hover': {
      borderColor: darkColors.primaryLight,
    },
  },
  icon: {
    color: darkColors.primaryLight,
  },
  control: {
    position: 'absolute',
    bottom: -36,
    right: 0,
    backgroundColor: darkColors.primaryPurple,
    color: darkColors.lightText,
    '&:hover': {
      backgroundColor: darkColors.secondaryPurple,
    },
    '&[data-active]': {
        backgroundColor: darkColors.primaryPurple,
        color: '#FFF', // active text color
      },
  },
  container: {
    backgroundColor: darkColors.darkBg,
    padding: '24px',
    borderRadius: '8px',
    border: `1px solid ${darkColors.darkBorder}`,
  },
  formContainer: {
    backgroundColor: darkColors.darkPaper,
    padding: '24px',
    borderRadius: '8px',
    border: `1px solid ${darkColors.darkBorder}`,
  }
};

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CATEGORIES = [
  { value: 'academic', label: 'Academic' },
  { value: 'technical', label: 'Technical' },
  { value: 'general', label: 'General' },
  { value: 'other', label: 'Other' }
];

const TAGS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'homework', label: 'Homework' },
  { value: 'project', label: 'Project' },
  { value: 'exam', label: 'Exam' },
  { value: 'assignment', label: 'Assignment' }
];

export default function PostDoubt() {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const theme = useMantineTheme();
  
  const [doubtType, setDoubtType] = useState('text');
  const [doubtTitle, setDoubtTitle] = useState('');
  const [doubtDescription, setDoubtDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const openRef = useRef(null);

  const validateForm = () => {
    if (!doubtTitle.trim()) {
      setError('Please enter a doubt title');
      return false;
    }

    if (!category) {
      setError('Please select a category');
      return false;
    }

    if (doubtType === 'text' && !doubtDescription.trim()) {
      setError('Please describe your doubt');
      return false;
    }

    if (doubtType === 'image' && !image) {
      setError('Please upload an image');
      return false;
    }

    if (doubtType === 'image' && image && !image.type.match(/^image\/(jpeg|png)$/)) {
      setError('Please upload only JPEG or PNG images');
      return false;
    }

    return true;
  };

  const handleImageUpload = async (file) => {
    try {
      if (!user?.uid) {
        throw new Error('User must be authenticated to upload images');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', `doubts/${user.uid}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      console.error('Error in handleImageUpload:', err);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    setUploadProgress(0);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      let imageUrl = null;
      if (doubtType === 'image' && image) {
        imageUrl = await handleImageUpload(image);
      }

      const doubtData = {
        title: doubtTitle,
        description: doubtType === 'text' ? doubtDescription : '',
        category,
        tags,
        imageURL: imageUrl,
        email: user.email,
        postedBy: `/users/${user.uid}`,
        isAnonymous,
        status: 'open',
        commentCount: 0,
        createdAt: serverTimestamp(),
        type: doubtType
      };

      const doubtsCollection = collection(db, 'doubts');
      await addDoc(doubtsCollection, doubtData);
      navigate('/feed');
    } catch (err) {
      console.error('Error posting doubt:', err);
      setError(err.message || 'Failed to post doubt. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Custom theme for the MantineProvider
  const customTheme = {
    colorScheme: 'dark',
    colors: {
      dark: [
        darkColors.lightText,   // 0
        darkColors.dimmedText,  // 1
        '#909296',              // 2
        '#5c5f66',              // 3
        '#373A40',              // 4
        darkColors.darkBorder,  // 5
        darkColors.darkComponent, // 6
        darkColors.darkPaper,   // 7
        darkColors.darkBg,      // 8
        '#141517',              // 9
      ],
      purple: [
        '#f0e6ff',             // 0
        '#d9c2ff',             // 1
        '#c29eff',             // 2
        '#ab7aff',             // 3
        '#9457ff',             // 4
        '#7d33ff',             // 5
        darkColors.primaryLight, // 6
        darkColors.secondaryPurple, // 7
        '#4a1ca9',             // 8
        darkColors.primaryPurple, // 9
      ],
    },
    primaryColor: 'purple',
    primaryShade: 8,
    defaultRadius: 'md',
    components: {
      Button: {
        defaultProps: {
          color: 'purple',
        },
      },
      TextInput: {
        styles: {
          input: {
            backgroundColor: darkColors.darkComponent,
            borderColor: darkColors.darkBorder,
            color: darkColors.lightText,
            '&:focus': {
              borderColor: darkColors.primaryLight,
            },
          },
          label: {
            color: darkColors.dimmedText,
          },
        },
      },
      Textarea: {
        styles: {
          input: {
            backgroundColor: darkColors.darkComponent,
            borderColor: darkColors.darkBorder,
            color: darkColors.lightText,
            '&:focus': {
              borderColor: darkColors.primaryLight,
            },
          },
          label: {
            color: darkColors.dimmedText,
          },
        },
      },
      Select: {
        styles: {
          input: {
            backgroundColor: darkColors.darkComponent,
            borderColor: darkColors.darkBorder,
            color: darkColors.lightText,
          },
          label: {
            color: darkColors.dimmedText,
          },
          item: {
            '&[data-selected]': {
              backgroundColor: darkColors.primaryPurple,
            },
            '&[data-hovered]': {
              backgroundColor: darkColors.secondaryPurple,
            },
          },
          dropdown: {
            backgroundColor: darkColors.darkPaper,
            borderColor: darkColors.darkBorder,
          },
        },
      },
      MultiSelect: {
        styles: {
          input: {
            backgroundColor: darkColors.darkComponent,
            borderColor: darkColors.darkBorder,
            color: darkColors.lightText,
          },
          label: {
            color: darkColors.dimmedText,
          },
          item: {
            '&[data-selected]': {
              backgroundColor: darkColors.primaryPurple,
            },
            '&[data-hovered]': {
              backgroundColor: darkColors.secondaryPurple,
            },
          },
          dropdown: {
            backgroundColor: darkColors.darkPaper,
            borderColor: darkColors.darkBorder,
          },
          value: {
            backgroundColor: darkColors.primaryPurple,
          },
        },
      },
      SegmentedControl: {
        styles: {
          root: {
            backgroundColor: darkColors.darkComponent,
            border: `1px solid ${darkColors.darkBorder}`,
          },
          active: {
            backgroundColor: darkColors.primaryPurple,
          },
          label: {
            color: darkColors.lightText,
            '&[dataActive]': {
              color: 'black',
            },
          },
        },
      },
    },
  };

  return (
    <MantineProvider theme={customTheme}
      withGlobalStyles
      withNormalizeCSS>
        <Global
        styles={() => ({
          'html, body': {
            backgroundColor: darkColors.darkBg,
            margin: 0,
            padding: 0,
          },
        })}
      />
      <div style={{ 
        backgroundColor: darkColors.darkBg, 
        minHeight: '100vh',
        color: darkColors.lightText,
      }} className="flex">
        <div className='hidden md:block'>
          <Navbar />
        </div>
        <div className="flex-1 md:ml-[300px] p-6">
          <Container size="lg" style={{ backgroundColor: darkColors.darkBg }}>
            <div style={customStyles.container}>
              <Title order={2} mb="xl" style={{ color: darkColors.lightText, textAlign: 'left' }}>
                Post Your Doubt
              </Title>

              {error && (
                <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing="md">
                  <TextInput
                    label="Doubt Title"
                    placeholder="Enter your doubt title"
                    value={doubtTitle}
                    onChange={(event) => setDoubtTitle(event.currentTarget.value)}
                    required
                    size="md"
                  />

                  <Select
                    label="Category"
                    placeholder="Select a category"
                    data={CATEGORIES}
                    value={category}
                    onChange={setCategory}
                    required
                  />

                  <MultiSelect
                    label="Tags"
                    placeholder="Select tags"
                    data={TAGS}
                    value={tags}
                    onChange={setTags}
                  />

                  <SegmentedControl
                    value={doubtType}
                    onChange={setDoubtType}
                    data={[
                      { label: 'Text', value: 'text' },
                      { label: 'Image', value: 'image' }
                    ]}
                    fullWidth
                  />

                  {doubtType === 'text' ? (
                    <Textarea
                      label="Doubt Description"
                      placeholder="Describe your doubt in detail"
                      value={doubtDescription}
                      onChange={(event) => setDoubtDescription(event.currentTarget.value)}
                      required
                      minRows={4}
                      size="md"
                    />
                  ) : (
                    <div>
                      {image ? (
                        <Paper p="md" style={{ 
                          backgroundColor: darkColors.darkComponent, 
                          borderColor: darkColors.darkBorder,
                          borderWidth: 1,
                          borderStyle: 'solid'
                        }}>
                          <Stack>
                            <div className="relative">
                              <img 
                                src={URL.createObjectURL(image)} 
                                alt="Preview" 
                                className="max-h-[300px] w-full object-contain rounded"
                              />
                              <Button
                                color="red"
                                variant="filled"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  URL.revokeObjectURL(image);
                                  setImage(null);
                                }}
                              >
                                <IconX size={16} />
                              </Button>
                            </div>
                            <Text size="sm" ta="center" style={{ color: darkColors.dimmedText }}>
                              Click the X button to remove the image and upload a different one
                            </Text>
                          </Stack>
                        </Paper>
                      ) : (
                        <div style={customStyles.wrapper}>
                          <Dropzone
                            openRef={openRef}
                            onDrop={(files) => setImage(files[0])}
                            style={customStyles.dropzone}
                            radius="md"
                            accept={[MIME_TYPES.jpeg, MIME_TYPES.png]}
                            maxSize={5 * 1024 ** 2}
                          >
                            <div style={{ pointerEvents: 'none' }}>
                              <Group justify="center">
                                <Dropzone.Accept>
                                  <IconDownload size={50} color={darkColors.primaryLight} stroke={1.5} />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                  <IconX size={50} color="red" stroke={1.5} />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                  <IconCloudUpload size={50} stroke={1.5} style={{ color: darkColors.primaryLight }} />
                                </Dropzone.Idle>
                              </Group>

                              <Text ta="center" fw={700} fz="lg" mt="xl" style={{ color: darkColors.lightText }}>
                                <Dropzone.Accept>Drop image here</Dropzone.Accept>
                                <Dropzone.Reject>Image must be less than 5mb</Dropzone.Reject>
                                <Dropzone.Idle>Upload doubt image</Dropzone.Idle>
                              </Text>
                              <Text ta="center" fz="sm" mt="xs" style={{ color: darkColors.dimmedText }}>
                                Drag and drop images here to upload. We can accept only <i>.jpg</i> and <i>.png</i> files that are less than 5mb in size.
                              </Text>
                            </div>
                          </Dropzone>
                        </div>
                      )}
                    </div>
                  )}

                  <SegmentedControl
                    value={isAnonymous ? 'anonymous' : 'public'}
                    onChange={(value) => setIsAnonymous(value === 'anonymous')}
                    data={[
                      { label: 'Public', value: 'public' },
                      { label: 'Anonymous', value: 'anonymous' }
                    ]}
                    fullWidth
                  />

                  {loading && (
                    <Progress 
                      value={uploadProgress} 
                      size="sm" 
                      color={darkColors.primaryLight}
                    />
                  )}

                  <Button 
                    type="submit" 
                    fullWidth 
                    size="md" 
                    loading={loading}
                    disabled={loading}
                    style={{ backgroundColor: darkColors.primaryPurple }}
                  >
                    Submit Doubt
                  </Button>
                </Stack>
              </form>
            </div>
          </Container>
        </div>
      </div>
    </MantineProvider>
  );
}
