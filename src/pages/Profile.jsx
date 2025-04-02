import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useSelector } from 'react-redux';
import { 
  MantineProvider, 
  Text, 
  Loader, 
  Center, 
  Container, 
  Paper, 
  Avatar, 
  Title, 
  Group, 
  Button, 
  Divider, 
  SimpleGrid, 
  Card, 
  Badge, 
  Tabs, 
  rem
} from '@mantine/core';
import { 
  IconUser, 
  IconMail, 
  IconSchool, 
  IconCalendar, 
  IconMessageDots, 
  IconThumbUp, 
  IconStar, 
  IconEdit, 
  IconBrandGoogle 
} from '@tabler/icons-react';

function Profile() {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('activity');

  // Extract email username and domain
  const getEmailParts = (email) => {
    if (!email) return { username: '', domain: '' };
    const parts = email.split('@');
    return {
      username: parts[0],
      domain: parts[1] || ''
    };
  };

  // Get user's roll number from email (assuming format like 23ucs123@lnmiit.ac.in)
  const getRollInfo = (email) => {
    if (!email) return { year: '', branch: '', number: '' };
    
    const { username } = getEmailParts(email);
    
    if (username.length < 7) return { year: '', branch: '', number: '' };
    
    return {
      year: username.substring(0, 2),
      branch: username.substring(2, 5).toUpperCase(),
      number: username.substring(5)
    };
  };

  // Mock data for user stats and activity
  const mockStats = {
    doubtsPosted: 5,
    doubtsAnswered: 12,
    upvotesReceived: 34
  };

  const mockActivity = [
    {
      id: 1,
      type: 'doubt',
      title: 'Help with Data Structures Assignment',
      date: '2 days ago',
      tags: ['DSA', 'Binary Trees'],
      responses: 3
    },
    {
      id: 2,
      type: 'answer',
      title: 'Answered: How to implement quicksort?',
      date: '1 week ago',
      tags: ['Algorithms', 'Sorting'],
      upvotes: 8
    },
    {
      id: 3,
      type: 'doubt',
      title: 'Understanding React Hooks',
      date: '2 weeks ago',
      tags: ['React', 'JavaScript'],
      responses: 5
    }
  ];

  if (loading) {
    return (
      <MantineProvider theme={{ colorScheme: 'dark' }}>
        <div style={{ backgroundColor: '#1A1B1E', minHeight: '100vh', color: '#C1C2C5' }}>
          <Navbar />
          <Center style={{ height: '80vh' }}>
            <Loader size="xl" />
          </Center>
        </div>
      </MantineProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <MantineProvider theme={{ colorScheme: 'dark' }}>
        <div style={{ backgroundColor: '#1A1B1E', minHeight: '100vh', color: '#C1C2C5' }}>
          <Navbar />
          <Center style={{ height: '80vh' }}>
            <Paper p="xl" radius="md" withBorder>
              <Text size="xl" weight={700} align="center">
                Please login to view your profile
              </Text>
              <Center mt="xl">
                <Button leftIcon={<IconBrandGoogle size={20} />} component="a" href="/">
                  Login with Google
                </Button>
              </Center>
            </Paper>
          </Center>
        </div>
      </MantineProvider>
    );
  }

  const { username, domain } = getEmailParts(user?.email);
  const { year, branch, number } = getRollInfo(user?.email);
  const userInitial = username ? username[0].toUpperCase() : '?';
  const fullYear = year ? `20${year}` : '';

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <div style={{ backgroundColor: '#1A1B1E', minHeight: '100vh', color: '#C1C2C5' }}>
        {/* Navbar */}
        <div>
          <Navbar />
        </div>

        {/* Main Content */}
        <div className='flex-1 md:ml-[300px] p-4'>
          <Container size="lg">
            {/* Profile Header */}
            <Paper radius="md" p="xl" withBorder mb="md">
              <Group position="apart" align="flex-start">
                <Group>
                  <Avatar 
                    size={80} 
                    color="blue" 
                    radius={80}
                    src={user?.photoURL}
                  >
                    {!user?.photoURL && userInitial}
                  </Avatar>
                  <div>
                    <Title order={3}>{user?.displayName || username}</Title>
                    <Group spacing={5}>
                      <IconMail size={14} />
                      <Text size="sm" color="dimmed">{user?.email}</Text>
                    </Group>
                    {branch && (
                      <Group spacing={5} mt={5}>
                        <IconSchool size={14} />
                        <Text size="sm" color="dimmed">
                          {branch} Student {fullYear && `(Batch of ${fullYear})`}
                        </Text>
                      </Group>
                    )}
                    <Badge mt={10} color="blue">LNMIIT Student</Badge>
                  </div>
                </Group>
                {/* <Button 
                  leftIcon={<IconEdit size={16} />}
                  variant="outline"
                  radius="md"
                >
                  Edit Profile
                </Button> */}
              </Group>
            </Paper>

            {/* Stats Cards */}
            {/* <SimpleGrid cols={3} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} mb="md">
              <Card p="md" radius="md" withBorder>
                <Group position="apart">
                  <Text size="lg" weight={500}>Doubts Posted</Text>
                  <IconMessageDots size={20} color="#4DABF7" />
                </Group>
                <Text size="xl" weight={700} mt="md">{mockStats.doubtsPosted}</Text>
              </Card>
              <Card p="md" radius="md" withBorder>
                <Group position="apart">
                  <Text size="lg" weight={500}>Doubts Answered</Text>
                  <IconStar size={20} color="#FAB005" />
                </Group>
                <Text size="xl" weight={700} mt="md">{mockStats.doubtsAnswered}</Text>
              </Card>
              <Card p="md" radius="md" withBorder>
                <Group position="apart">
                  <Text size="lg" weight={500}>Upvotes Received</Text>
                  <IconThumbUp size={20} color="#82C91E" />
                </Group>
                <Text size="xl" weight={700} mt="md">{mockStats.upvotesReceived}</Text>
              </Card>
            </SimpleGrid> */}

            {/* Activity and Settings Tabs */}
            {/* <Paper radius="md" p="md" withBorder>
              <Tabs value={activeTab} onTabChange={setActiveTab}>
                <Tabs.List>
                  <Tabs.Tab 
                    value="activity" 
                    icon={<IconMessageDots size={rem(14)} />}
                  >
                    Activity
                  </Tabs.Tab>
                  <Tabs.Tab 
                    value="settings" 
                    icon={<IconUser size={rem(14)} />}
                  >
                    Profile Settings
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="activity" pt="xs">
                  {mockActivity.map((item) => (
                    <Paper key={item.id} p="md" withBorder radius="md" mb="md">
                      <Group position="apart">
                        <div>
                          <Group>
                            <Badge 
                              color={item.type === 'doubt' ? 'blue' : 'green'}
                              variant="filled"
                            >
                              {item.type === 'doubt' ? 'Question' : 'Answer'}
                            </Badge>
                            <Text size="xs" color="dimmed">{item.date}</Text>
                          </Group>
                          <Text weight={500} mt="xs">{item.title}</Text>
                          <Group spacing={5} mt={5}>
                            {item.tags.map((tag) => (
                              <Badge key={tag} size="sm" variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </Group>
                        </div>
                        <Group>
                          {item.type === 'doubt' ? (
                            <Badge leftSection={<IconMessageDots size={12} />}>
                              {item.responses} responses
                            </Badge>
                          ) : (
                            <Badge leftSection={<IconThumbUp size={12} />}>
                              {item.upvotes} upvotes
                            </Badge>
                          )}
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Tabs.Panel>

                <Tabs.Panel value="settings" pt="xs">
                  <Paper p="md" withBorder radius="md">
                    <Title order={4} mb="md">Account Information</Title>
                    <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                      <div>
                        <Text size="sm" color="dimmed">Name</Text>
                        <Text>{user?.displayName || 'Not set'}</Text>
                      </div>
                      <div>
                        <Text size="sm" color="dimmed">Email</Text>
                        <Text>{user?.email}</Text>
                      </div>
                      <div>
                        <Text size="sm" color="dimmed">Account Created</Text>
                        <Text>{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</Text>
                      </div>
                      <div>
                        <Text size="sm" color="dimmed">Last Login</Text>
                        <Text>{user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}</Text>
                      </div>
                    </SimpleGrid>
                    
                    <Divider my="lg" />
                    
                    <Group position="apart">
                      <div>
                        <Title order={4}>Google Account</Title>
                        <Text size="sm" color="dimmed">Your account is linked with Google</Text>
                      </div>
                      <Button 
                        leftIcon={<IconBrandGoogle size={16} />}
                        variant="light"
                        disabled
                      >
                        Connected
                      </Button>
                    </Group>
                  </Paper>
                </Tabs.Panel>
              </Tabs>
            </Paper> */}
          </Container>
        </div>
      </div>
    </MantineProvider>
  );
}

export default Profile;
