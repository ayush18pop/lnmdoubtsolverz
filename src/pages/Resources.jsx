import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import { MantineProvider, Text, Button, Select, TextInput, Group, Stack, Card, Badge, Tabs, Loader, Modal, FileInput, Textarea, Grid, Container, Box, Title, Paper, useMantineTheme } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { IconUpload, IconX, IconDownload, IconFilter, IconSearch, IconPlus } from '@tabler/icons-react';

// Cloudinary configuration
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Data for filtering
const BRANCHES = [
  { value: 'CCE', label: 'Communication and Computer Engineering (CCE)' },
  { value: 'CSE', label: 'Computer Science and Engineering (CSE)' },
  { value: 'ECE', label: 'Electronics and Communication Engineering (ECE)' },
  { value: 'ME', label: 'Mechanical Engineering (ME)' },
];

const SEMESTERS = [
  { value: '1', label: '1st Semester' },
  { value: '2', label: '2nd Semester' },
  { value: '3', label: '3rd Semester' },
  { value: '4', label: '4th Semester' },
  { value: '5', label: '5th Semester' },
  { value: '6', label: '6th Semester' },
  { value: '7', label: '7th Semester' },
  { value: '8', label: '8th Semester' },
];

// Subject data organized by branch and semester
const SUBJECTS = {
  CCE: {
    '1': [
      'Classical Physics',
      'Calculus and Ordinary Differential Equations',
      'Basic Electronics',
      'Basic Electronics Lab',
      'Programming for Problem Solving',
      'Technical Communication in English',
      'Indian Knowledge System'
    ],
    '2': [
      'Human Values and Ethics',
      'Environmental Science',
      'Linear Algebra and Complex Analysis',
      'Data Structures and Algorithms',
      'UG Physics Laboratory',
      'Introduction to Scripting Languages',
      'Digital Systems',
      'Discrete Mathematics'
    ],
    '3': [
      'Probability and Statistics',
      'Design and Analysis of Algorithms',
      'Signals and Systems',
      'Computer Organization and Architecture',
      'Database Management Systems',
      'Object Oriented Programming'
    ],
    '4': [
      'Constitutional Studies',
      'Web Programming',
      'Operating Systems',
      'Computer Communication Networks',
      'Analog and Digital Communication',
      'Analog and Digital Communication Lab',
      'Embedded Systems and IoT'
    ],
    '5': [
      'Psychology, Technology & Society',
      'Wireless Communication',
      'Wireless Communication Lab',
      'Software Engineering',
      'Digital Signal Processing',
      'Digital Signal Processing Lab',
      'Software Development Lab'
    ],
    '6': [
      'Introduction to Economics',
      'Information Theory and Coding',
      'Control System Engineering',
      'Introduction to AI and ML'
    ],
    '7': ['Electives/Projects'],
    '8': ['Electives/Projects']
  },
  CSE: {
    '1': [
      'Classical Physics',
      'Calculus and Ordinary Differential Equations',
      'Basic Electronics',
      'Basic Electronics Lab',
      'Programming for Problem Solving',
      'Technical Communication in English',
      'Indian Knowledge System'
    ],
    '2': [
      'Human Values and Ethics',
      'Environmental Science',
      'Linear Algebra and Complex Analysis',
      'Data Structures and Algorithms',
      'UG Physics Laboratory',
      'Introduction to Scripting Languages',
      'Digital Systems',
      'Discrete Mathematics'
    ],
    '3': [
      'Probability and Statistics',
      'Signals and Systems',
      'Computer Organization and Architecture',
      'Database Management Systems',
      'Object Oriented Programming',
      'Design and Analysis of Algorithms'
    ],
    '4': [
      'Constitutional Studies',
      'Principles of Management',
      'Web Programming',
      'Theory of Computation',
      'Operating Systems',
      'Computer Networks',
      'Data Science'
    ],
    '5': [
      'Psychology, Technology & Society',
      'Software Engineering',
      'Artificial Intelligence',
      'Computer System Security',
      'Software Development Lab'
    ],
    '6': [
      'Introduction to Economics',
      'Numerical Analysis and Scientific Computing'
    ],
    '7': ['Electives/Projects'],
    '8': ['Electives/Projects']
  },
  ECE: {
    '1': [
      'Classical Physics',
      'Calculus and Ordinary Differential Equations',
      'Basic Electronics',
      'Basic Electronics Lab',
      'Programming for Problem Solving',
      'Technical Communication in English',
      'Indian Knowledge System'
    ],
    '2': [
      'Human Values and Ethics',
      'Environmental Science',
      'Linear Algebra and Complex Analysis',
      'Data Structures and Algorithms',
      'UG Physics Laboratory',
      'Introduction to Scripting Languages',
      'Semiconductor Devices and Circuits',
      'Analog Electronics',
      'Analog Electronics Lab'
    ],
    '3': [
      'Probability and Statistics',
      'Signals and Systems',
      'Signals and Systems Lab',
      'Digital Circuits and Systems',
      'Digital Circuits and Systems Lab',
      'Engineering Electromagnetics',
      'Microprocessor and Microcontroller',
      'Microprocessor and Microcontroller Lab',
      'Network Analysis and Synthesis'
    ],
    '4': [
      'Constitutional Studies',
      'Analog and Digital Communication',
      'Analog and Digital Communication Lab',
      'Fundamentals of VLSI',
      'VLSI Lab',
      'Microwave Engineering',
      'Microwave Engineering Lab',
      'Design and Project Lab',
      'Introduction to AI and ML'
    ],
    '5': [
      'Psychology, Technology & Society',
      'Wireless Communication',
      'Wireless Communication Lab',
      'Control System Engineering',
      'Digital Signal Processing',
      'Digital Signal Processing Lab'
    ],
    '6': [
      'Introduction to Economics',
      '5G Wireless Systems and Beyond',
      'Computer Communication Networks'
    ],
    '7': ['Electives/Projects'],
    '8': ['Electives/Projects']
  },
  ME: {
    '1': [
      'Classical Physics',
      'Calculus and Ordinary Differential Equations',
      'Basic Electronics',
      'Basic Electronics Lab',
      'Programming for Problem Solving',
      'Technical Communication in English',
      'Indian Knowledge System'
    ],
    '2': [
      'Human Values and Ethics',
      'Environmental Science',
      'Linear Algebra and Complex Analysis',
      'Data Structures and Algorithms',
      'UG Physics Lab',
      'Introduction to Scripting Languages',
      'Introduction to Mechanical Engineering',
      'Engineering Drawing and Graphics',
      'Workshop Practices',
      'Engineering Physical Metallurgy'
    ],
    '3': [
      'Probability and Statistics',
      'Mechanics of Solids',
      'Rigid Body Dynamics',
      'Engineering Thermodynamics',
      'Welding and Casting',
      'Electrical Technology'
    ],
    '4': [
      'Constitutional Studies',
      'Design of Machine Elements',
      'Fluid Mechanics and Machinery',
      'Machining and Metal Forming',
      'Mechanisms and Machines',
      'Introduction to Computational Methods',
      'Industrial Measurements'
    ],
    '5': [
      'Heat Transfer',
      'Design of Transmission Elements',
      'Digital Manufacturing',
      'Robotics and Control',
      'Mechatronics & IoT'
    ],
    '6': [
      'Introduction to Economics',
      'IC Engines',
      'Finite Element Methods',
      'Industrial Engineering and Management'
    ],
    '7': ['Electives/Projects'],
    '8': ['Electives/Projects']
  }
};

const RESOURCE_TYPES = [
  { value: 'study_materials', label: 'Study Materials' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'midsems', label: 'Midsems' },
  { value: 'endsems', label: 'Endsems' },
];

function Resources() {
  const { user } = useSelector(state => state.auth);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadBranch, setUploadBranch] = useState('');
  const [uploadSemester, setUploadSemester] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadResourceType, setUploadResourceType] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]); 
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [filesUploaded, setFilesUploaded] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);

  // Filter states
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const theme = useMantineTheme();

  // Fetch resources on component mount and when filters change
  useEffect(() => {
    fetchResources();
  }, [branch, semester, subject, resourceType, searchQuery]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      let resourcesQuery = collection(db, 'resources');
      
      // Apply filters if they exist
      if (branch || semester || subject || resourceType) {
        resourcesQuery = query(resourcesQuery, 
          ...(branch ? [where('branch', '==', branch)] : []),
          ...(semester ? [where('semester', '==', semester)] : []),
          ...(subject ? [where('subject', '==', subject)] : []),
          ...(resourceType ? [where('resourceType', '==', resourceType)] : []),
          orderBy('createdAt', 'desc')
        );
      } else {
        resourcesQuery = query(resourcesQuery, orderBy('createdAt', 'desc'));
      }
      
      const querySnapshot = await getDocs(resourcesQuery);
      let fetchedResources = [];
      
      querySnapshot.forEach((doc) => {
        fetchedResources.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Apply search filter if it exists
      if (searchQuery) {
        fetchedResources = fetchedResources.filter(resource => 
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setResources(fetchedResources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      if (error.code === 'permission-denied') {
        notifications.show({
          title: 'Access Denied',
          message: 'Please sign in with your LNMIIT email to access resources.',
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to fetch resources. Please try again later.',
          color: 'red',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadTitle || !uploadBranch || !uploadSemester || !uploadSubject || !uploadResourceType || uploadFiles.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all required fields and select files',
        color: 'red',
      });
      return;
    }

    setUploading(true);
    setTotalFiles(uploadFiles.length);
    setFilesUploaded(0);

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        setCurrentFileIndex(i + 1);
        setCurrentFileName(uploadFiles[i].name);
        
        // Upload file to Cloudinary
        const formData = new FormData();
        formData.append('file', uploadFiles[i]);
        formData.append('upload_preset', UPLOAD_PRESET);

        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 500);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const data = await response.json();
        setUploadProgress(100);

        // Save resource metadata to Firestore
        await addDoc(collection(db, 'resources'), {
          title: uploadTitle,
          description: uploadDescription,
          branch: uploadBranch,
          semester: uploadSemester,
          subject: uploadSubject,
          resourceType: uploadResourceType,
          fileUrl: data.secure_url,
          fileName: uploadFiles[i].name,
          fileType: uploadFiles[i].type,
          fileSize: uploadFiles[i].size,
          uploadedBy: user.uid,
          uploadedByName: user.displayName || 'Anonymous',
          createdAt: new Date(),
        });

        setFilesUploaded(prev => prev + 1);
      }

      notifications.show({
        title: 'Success',
        message: `Successfully uploaded ${uploadFiles.length} files`,
        color: 'green',
      });

      // Reset form
      setUploadTitle('');
      setUploadDescription('');
      setUploadBranch('');
      setUploadSemester('');
      setUploadSubject('');
      setUploadResourceType('');
      setUploadFiles([]);
      setUploadProgress(0);
      setCurrentFileIndex(0);
      setTotalFiles(0);
      setFilesUploaded(0);
      setCurrentFileName('');
      setBulkUploadModalOpen(false);
    } catch (error) {
      console.error('Error uploading resources:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to upload some files. Please try again.',
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (files) => {
    setUploadFiles(files);
  };

  const handleClearFiles = () => {
    setUploadFiles([]);
    setCurrentFileName('');
  };

  const handleSingleUpload = async () => {
    if (uploadFiles.length > 1) {
      setBulkUploadModalOpen(true);
      return;
    }

    await handleBulkUpload();
  };

  // Reset subject when branch or semester changes
  useEffect(() => {
    setSubject('');
  }, [branch, semester]);

  useEffect(() => {
    setUploadSubject('');
  }, [uploadBranch, uploadSemester]);

  // Get filtered subjects based on selected branch and semester
  const getFilteredSubjects = (selectedBranch, selectedSemester) => {
    if (!selectedBranch || !selectedSemester) return [];
    
    return SUBJECTS[selectedBranch]?.[selectedSemester]?.map(subject => ({
      value: subject,
      label: subject,
    })) || [];
  };

  // Group resources by type for the tabs
  const groupedResources = {
    study_materials: resources.filter(r => r.resourceType === 'study_materials'),
    quiz: resources.filter(r => r.resourceType === 'quiz'),
    midsems: resources.filter(r => r.resourceType === 'midsems'),
    endsems: resources.filter(r => r.resourceType === 'endsems'),
  };

  const [filtersExpanded, setFiltersExpanded] = useState(false);

  return (
    <MantineProvider theme={{ 
      colorScheme: 'dark',
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
          })
        },
        Text: {
          styles: (theme) => ({
            root: {
              color: theme.colors.gray[0]
            }
          })
        },
        Title: {
          styles: (theme) => ({
            root: {
              color: theme.colors.gray[0]
            }
          })
        }
      }
    }}>
      <div style={{ backgroundColor: theme.colors.dark[9], minHeight: '100vh', color: theme.colors.dark[0] }}>
        {/* Navbar */}
        <div>
          <Navbar />
        </div>
        
        {/* Main Content */}
        <div className="md:ml-[300px] p-4 max-w-[1400px] mx-auto">
          {/* Header and Contribute Button */}
          <div className="bg-[#25262b] rounded-lg p-6 mb-6 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div>
                <Title order={1} className="text-2xl md:text-3xl font-bold mb-2" style={{ color: theme.colors.gray[0] }}>Resource Hub</Title>
                <Text size="md" color="dimmed" className="max-w-2xl">
                  Find study materials, quizzes, and exam papers shared by your peers. Filter by branch, semester, and subject to find exactly what you need.
                </Text>
              </div>
              <Button 
                leftIcon={<IconPlus size={16} />} 
                color="blue" 
                onClick={() => setUploadModalOpen(true)}
                className="w-full sm:w-auto mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 transition-all"
                size="md"
              >
                Contribute Resources
              </Button>
            </div>
            
            {/* Search Bar - Prominent Position */}
            <TextInput
              placeholder="Search by title or description"
              icon={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
              size="md"
              styles={{
                input: { 
                  backgroundColor: theme.colors.dark[6],
                  borderColor: theme.colors.dark[5],
                  '&:focus': { borderColor: theme.colors.blue[5] }
                }
              }}
            />
            
            {/* Collapsible Filters */}
            <Paper p="md" className="bg-[#2C2E33] border border-[#373A40] rounded-md">
              <Group position="apart" className="cursor-pointer" onClick={() => setFiltersExpanded(!filtersExpanded)}>
                <Group>
                  <IconFilter size={16} />
                  <Title order={4}>Advanced Filters</Title>
                </Group>
                <Button variant="subtle" compact>
                  {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </Group>
              
              {filtersExpanded && (
                <Grid className="mt-4">
                  <Grid.Col xs={12} sm={6} md={3}>
                    <Select
                      label="Branch"
                      placeholder="Select branch"
                      data={BRANCHES}
                      value={branch}
                      onChange={setBranch}
                      clearable
                      searchable
                      styles={{
                        input: { backgroundColor: theme.colors.dark[6] }
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col xs={12} sm={6} md={3}>
                    <Select
                      label="Semester"
                      placeholder="Select semester"
                      data={SEMESTERS}
                      value={semester}
                      onChange={setSemester}
                      clearable
                      disabled={!branch}
                      styles={{
                        input: { backgroundColor: theme.colors.dark[6] }
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col xs={12} sm={6} md={3}>
                    <Select
                      label="Subject"
                      placeholder="Select subject"
                      data={getFilteredSubjects(branch, semester)}
                      value={subject}
                      onChange={setSubject}
                      clearable
                      searchable
                      disabled={!branch || !semester}
                      styles={{
                        input: { backgroundColor: theme.colors.dark[6] }
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col xs={12} sm={6} md={3}>
                    <Select
                      label="Resource Type"
                      placeholder="Select type"
                      data={RESOURCE_TYPES}
                      value={resourceType}
                      onChange={setResourceType}
                      clearable
                      styles={{
                        input: { backgroundColor: theme.colors.dark[6] }
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col xs={12} className="flex justify-end mt-2">
                    <Button 
                      variant="outline" 
                      color="gray" 
                      onClick={() => {
                        setBranch('');
                        setSemester('');
                        setSubject('');
                        setResourceType('');
                        setSearchQuery('');
                      }}
                      compact
                      className="mr-2"
                    >
                      Clear Filters
                    </Button>
                    <Button 
                      color="blue" 
                      onClick={fetchResources}
                      compact
                    >
                      Apply Filters
                    </Button>
                  </Grid.Col>
                </Grid>
              )}
            </Paper>
          </div>
          
          {/* Resources Display */}
          <div className="bg-[#25262b] rounded-lg p-6 shadow-md">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-20">
                <Loader size="lg" color="blue" />
                <Text size="md" color="dimmed" mt={10}>Loading resources...</Text>
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="inline-flex rounded-full bg-[#2C2E33] p-6 mb-4">
                  <IconDownload size={32} className="text-blue-400" />
                </div>
                <Text size="xl" weight={600} mb={10} style={{ color: theme.colors.gray[0] }}>No resources found</Text>
                <Text color="dimmed" size="md" className="max-w-md mx-auto mb-6">
                  Try adjusting your filters or be the first to contribute resources for this category!
                </Text>
                <Button 
                  color="blue" 
                  onClick={() => setUploadModalOpen(true)}
                  leftIcon={<IconPlus size={16} />}
                >
                  Contribute Resources
                </Button>
              </div>
            ) : (
              <Tabs 
                defaultValue="study_materials" 
                styles={{
                  tabsList: { borderColor: theme.colors.dark[5] },
                  tab: { 
                    '&[data-active]': { 
                      borderColor: theme.colors.blue[5],
                      color: 'white'
                    }
                  }
                }}
              >
                <Tabs.List className="mb-4 overflow-x-auto flex-nowrap">
                  <Tabs.Tab value="study_materials" icon={<IconDownload size={14} />}>
                    Study Materials ({groupedResources.study_materials.length})
                  </Tabs.Tab>
                  <Tabs.Tab value="quiz" icon={<IconDownload size={14} />}>
                    Quiz ({groupedResources.quiz.length})
                  </Tabs.Tab>
                  <Tabs.Tab value="midsems" icon={<IconDownload size={14} />}>
                    Midsems ({groupedResources.midsems.length})
                  </Tabs.Tab>
                  <Tabs.Tab value="endsems" icon={<IconDownload size={14} />}>
                    Endsems ({groupedResources.endsems.length})
                  </Tabs.Tab>
                </Tabs.List>
                
                {Object.entries(groupedResources).map(([type, items]) => (
                  <Tabs.Panel value={type} key={type} pt="md">
                    <Grid>
                      {items.map(resource => (
                        <Grid.Col xs={12} sm={6} lg={4} key={resource.id}>
                          <Card 
                            p="lg" 
                            radius="md" 
                            withBorder 
                            className="h-full hover:shadow-lg transition-shadow duration-200 hover:border-blue-500"
                            styles={{
                              root: {
                                backgroundColor: theme.colors.dark[7],
                                borderColor: theme.colors.dark[5]
                              }
                            }}
                          >
                            <Card.Section p="md" 
                              styles={{
                                root: {
                                  backgroundColor: theme.colors.dark[8],
                                  borderBottom: `1px solid ${theme.colors.dark[5]}`
                                }
                              }}
                            >
                              <Group position="apart">
                                <Text weight={600} size="lg" lineClamp={1} style={{ color: theme.colors.gray[0] }}>
                                  {resource.title}
                                </Text>
                                <Badge 
                                  color={
                                    resource.resourceType === 'study_materials' ? 'blue' : 
                                    resource.resourceType === 'quiz' ? 'green' : 
                                    resource.resourceType === 'midsems' ? 'orange' : 
                                    'red'
                                  }
                                  variant="filled"
                                  className="capitalize"
                                >
                                  {resource.resourceType.replace('_', ' ')}
                                </Badge>
                              </Group>
                            </Card.Section>
                            
                            <Stack spacing="xs" mt="md">
                              <Text size="sm" style={{ color: theme.colors.gray[3] }} lineClamp={2} className="min-h-[40px]">
                                {resource.description || 'No description provided'}
                              </Text>
                              
                              <div className="mt-2 p-2 rounded-md" style={{ backgroundColor: theme.colors.dark[8] }}>
                                <Group spacing="xs" className="mb-1">
                                  <Text size="xs" style={{ color: theme.colors.gray[5] }} className="w-20">Branch:</Text>
                                  <Text size="xs" style={{ color: theme.colors.gray[0] }}>{resource.branch}</Text>
                                </Group>
                                <Group spacing="xs" className="mb-1">
                                  <Text size="xs" style={{ color: theme.colors.gray[5] }} className="w-20">Semester:</Text>
                                  <Text size="xs" style={{ color: theme.colors.gray[0] }}>{resource.semester}</Text>
                                </Group>
                                <Group spacing="xs">
                                  <Text size="xs" style={{ color: theme.colors.gray[5] }} className="w-20">Subject:</Text>
                                  <Text size="xs" style={{ color: theme.colors.gray[0] }}>{resource.subject}</Text>
                                </Group>
                              </div>
                              
                              <Group position="apart" mt="md" className="pt-2" style={{ borderTop: `1px solid ${theme.colors.dark[5]}` }}>
                                <Text size="xs" style={{ color: theme.colors.gray[5] }}>
                                  Uploaded by {resource.uploadedByName}
                                </Text>
                                <Button 
                                  component="a" 
                                  href={resource.fileUrl} 
                                  target="_blank" 
                                  variant="light"
                                  color="blue"
                                  compact
                                  className="hover:bg-blue-600 hover:text-white transition-colors"
                                  leftIcon={<IconDownload size={14} />}
                                >
                                  Download
                                </Button>
                              </Group>
                            </Stack>
                          </Card>
                        </Grid.Col>
                      ))}
                    </Grid>
                  </Tabs.Panel>
                ))}
              </Tabs>
            )}
          </div>
        </div>
        
        {/* Upload Modal */}
        <Modal
          opened={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setUploadFiles([]);
            setCurrentFileName('');
          }}
          title={<Text size="xl" weight={700}>Contribute a Resource</Text>}
          size="lg"
          padding="xl"
          styles={{
            modal: { backgroundColor: theme.colors.dark[9] },
            header: { backgroundColor: theme.colors.dark[9] }
          }}
        >
          <div className="mb-4">
            <Text size="sm" color="dimmed" mb="md">
              Share your study materials, quizzes, or exam papers with your peers. All uploads require authentication with your LNMIIT email.
            </Text>
          </div>
          
          <TextInput
            label="Title"
            placeholder="Enter a descriptive title"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            required
            mb="md"
            styles={{ input: { backgroundColor: theme.colors.dark[6] } }}
          />
          
          <Textarea
            label="Description"
            placeholder="Provide a brief description of the resource"
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            minRows={3}
            mb="md"
            styles={{ input: { backgroundColor: theme.colors.dark[6] } }}
          />
          
          <Grid mb="md">
            <Grid.Col xs={12} sm={4}>
              <Select
                label="Branch"
                placeholder="Select branch"
                data={BRANCHES}
                value={uploadBranch}
                onChange={setUploadBranch}
                required
                searchable
                styles={{ input: { backgroundColor: theme.colors.dark[6] } }}
              />
            </Grid.Col>
            <Grid.Col xs={12} sm={4}>
              <Select
                label="Semester"
                placeholder="Select semester"
                data={SEMESTERS}
                value={uploadSemester}
                onChange={setUploadSemester}
                required
                disabled={!uploadBranch}
                styles={{ input: { backgroundColor: theme.colors.dark[6] } }}
              />
            </Grid.Col>
            <Grid.Col xs={12} sm={4}>
              <Select
                label="Resource Type"
                placeholder="Select type"
                data={RESOURCE_TYPES}
                value={uploadResourceType}
                onChange={setUploadResourceType}
                required
                styles={{ input: { backgroundColor: theme.colors.dark[6] } }}
              />
            </Grid.Col>
          </Grid>
          
          <Select
            label="Subject"
            placeholder="Select subject"
            data={getFilteredSubjects(uploadBranch, uploadSemester)}
            value={uploadSubject}
            onChange={setUploadSubject}
            required
            searchable
            disabled={!uploadBranch || !uploadSemester}
            mb="xl"
            styles={{ input: { backgroundColor: theme.colors.dark[6] } }}
          />
          
          <Dropzone
            onDrop={handleFileSelect}
            maxSize={10 * 1024 * 1024} 
            accept={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']}
            multiple 
            mb="xl"
            className="border-dashed border-2 border-[#373A40] hover:border-blue-500 transition-colors"
            styles={{ root: { backgroundColor: theme.colors.dark[6] } }}
          >
            <Group position="center" spacing="xl" style={{ minHeight: 120, pointerEvents: 'none' }}>
              <div className="text-center">
                {uploadFiles.length > 0 ? (
                  <>
                    <IconDownload size={32} color="#5C7CFA" />
                    <Text size="lg" inline mt="md" style={{ color: theme.colors.gray[0] }}>
                      {uploadFiles.length} file(s) selected
                    </Text>
                    <Text size="xs" color="dimmed" inline mt={7}>
                      Click or drag to replace
                    </Text>
                  </>
                ) : (
                  <>
                    <Text size="xl" inline style={{ color: theme.colors.gray[0] }}>
                      Here, you can drag multiple files too!
                    </Text>
                    <Text size="sm" color="dimmed" inline mt={7}>
                      Files should not exceed 10MB each
                    </Text>
                  </>
                )}
              </div>
            </Group>
          </Dropzone>
          
          {uploadFiles.length > 0 && (
            <div className="mt-4">
              <Text size="sm" color="dimmed" mb="2">
                Selected Files:
              </Text>
              <div className="space-y-2">
                {uploadFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-[#2C2E33] rounded-md">
                    <Group spacing="xs">
                      <IconDownload size={16} color="#5C7CFA" />
                      <Text size="sm" style={{ color: theme.colors.gray[0] }} className="truncate max-w-[200px]">
                        {file.name}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </Group>
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={() => {
                        setUploadFiles(uploadFiles.filter((_, i) => i !== index));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div className="mt-4 mb-4">
              <Text align="center" size="sm" mb={5}>
                Uploading file {currentFileIndex} of {totalFiles}: {currentFileName}
              </Text>
              <Text align="center" size="sm" mb={5}>
                Progress: {uploadProgress}%
              </Text>
              <div className="w-full bg-[#373A40] rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-violet-500 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <Text align="center" size="sm" mt={5}>
                Completed: {filesUploaded}/{totalFiles} files
              </Text>
            </div>
          )}
          
          <Group position="right" mt="xl">
            <Button variant="default" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              color="blue" 
              onClick={handleSingleUpload} 
              loading={uploading}
              disabled={!uploadTitle || !uploadBranch || !uploadSemester || !uploadSubject || !uploadResourceType || uploadFiles.length === 0}
              className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600"
            >
              {uploadFiles.length > 1 ? 'Upload Multiple Files' : 'Upload Resource'}
            </Button>
          </Group>
        </Modal>

        {/* Bulk Upload Confirmation Modal */}
        <Modal
          opened={bulkUploadModalOpen}
          onClose={() => setBulkUploadModalOpen(false)}
          title={<Text size="xl" weight={700}>Bulk Upload Confirmation</Text>}
          size="sm"
          padding="xl"
          styles={{
            modal: { backgroundColor: theme.colors.dark[9] },
            header: { backgroundColor: theme.colors.dark[9] }
          }}
        >
          <div className="mb-4">
            <Text size="sm" color="dimmed" mb="md">
              You have selected {uploadFiles.length} files. Would you like to upload them all with the same metadata?
            </Text>
          </div>
          
          <Group position="right" mt="xl">
            <Button variant="default" onClick={() => setBulkUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              color="blue" 
              onClick={handleBulkUpload} 
              loading={uploading}
              className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600"
            >
              Upload All Files
            </Button>
          </Group>
        </Modal>
      </div>
    </MantineProvider>
  );
}

export default Resources;
