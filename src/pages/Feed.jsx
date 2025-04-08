import { useState, useEffect } from 'react';
import { 
  Button, 
  Image, 
  Text, 
  Title, 
  Container,
  Group,
  ActionIcon,
  Badge,
  Tooltip,
  Paper,
  Card,
  Avatar,
  Transition,
  Skeleton,
  Grid,
  Divider,
  Menu,
  rem,
  Select,
  Tabs,
  ScrollArea,
  Indicator,
  ThemeIcon,
  UnstyledButton,
  Box,
  Flex,
  MantineProvider,
  Modal,
  TextInput,
  Textarea,
  Progress,
  FileButton,
  Stack
} from '@mantine/core';
import { 
  IconArrowUp, 
  IconArrowDown,
  IconClockHour4, 
  IconFlame,
  IconMessage,
  IconShare,
  IconBookmark,
  IconDots,
  IconUserCheck,
  IconPhoto,
  IconTrendingUp,
  IconMessageCircle,
  IconFilter,
  IconHeart,
  IconHeartFilled,
  IconBrandReddit,
  IconBrandAbstract,
  IconPackages,
  IconFileAi,
  IconFileChart,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';
import { collection, query, orderBy, getDocs, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useSelector } from 'react-redux';
import classes from './Feed.module.css';
import Navbar from '../components/Navbar';
import { formatDistanceToNow } from 'date-fns';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

// Define styles using CSS classes instead of createStyles
// You'll need to have these classes in your Feed.module.css file
// or you can use inline styles as shown below

export default function Feed() {
  const [doubts, setDoubts] = useState([]);
  const [sortBy, setSortBy] = useState('latest');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useSelector(state => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [filtersOpened, { toggle: toggleFilters }] = useDisclosure(false);
  const navigate = useNavigate();
  
  // Edit and delete states
  const [editDoubtId, setEditDoubtId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteDoubtId, setDeleteDoubtId] = useState(null);
  
  useEffect(() => {
    fetchDoubts();
    
    // Fix for white background: set both body and html backgrounds
    document.body.style.backgroundColor = '#1A1B1E'; // dark[9]
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.backgroundColor = '#1A1B1E'; // dark[9]
    
    // Clean up on unmount
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, [sortBy, activeTab]);

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const doubtsRef = collection(db, 'doubts');
      let q;
      
      if (sortBy === 'relevant') {
        // First get all doubts ordered by createdAt
        const allDoubtsQuery = query(doubtsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(allDoubtsQuery);
        const doubtsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          upvotedBy: doc.data().upvotedBy || [],
          downvotedBy: doc.data().downvotedBy || []
        }));
        
        // Filter doubts based on user's batch if email exists
        if (user?.email) {
          const userBatch = user.email.substring(0, 2);
          const filteredDoubts = doubtsData.filter(doubt => {
            return doubt.email && doubt.email.startsWith(userBatch);
          });
          setDoubts(filteredDoubts);
        } else {
          setDoubts(doubtsData);
        }
      } else {
        // For other sorting methods
        q = query(
          doubtsRef, 
          orderBy(sortBy === 'latest' ? 'createdAt' : 'totalVotes', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const doubtsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          upvotedBy: doc.data().upvotedBy || [],
          downvotedBy: doc.data().downvotedBy || []
        }));
        
        // Filter by category if tab is not 'all'
        if (activeTab !== 'all') {
          const filteredDoubts = doubtsData.filter(doubt => 
            doubt.category?.toLowerCase() === activeTab
          );
          setDoubts(filteredDoubts);
        } else {
          setDoubts(doubtsData);
        }
      }
    } catch (error) {
      console.error('Error fetching doubts:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load doubts. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (doubtId, voteType) => {
    if (!user) {
      notifications.show({
        title: 'Authentication required',
        message: 'Please log in to vote on doubts',
        color: 'blue',
      });
      return;
    }
  
    try {
      const doubtRef = doc(db, 'doubts', doubtId);
      const doubt = doubts.find(d => d.id === doubtId);
  
      const currentUpvoted = doubt.upvotedBy || [];
      const currentDownvoted = doubt.downvotedBy || [];
      let newUpvoted = [...currentUpvoted];
      let newDownvoted = [...currentDownvoted];
      let newTotalVotes = doubt.totalVotes || 0;
  
      const hasUpvoted = currentUpvoted.includes(user.uid);
      const hasDownvoted = currentDownvoted.includes(user.uid);
  
      if (voteType === 'up') {
        if (hasUpvoted) {
          newUpvoted = currentUpvoted.filter(uid => uid !== user.uid);
          newTotalVotes -= 1;
        } else {
          newUpvoted = [...currentUpvoted, user.uid];
          if (hasDownvoted) {
            newDownvoted = currentDownvoted.filter(uid => uid !== user.uid);
            newTotalVotes += 2;
          } else {
            newTotalVotes += 1;
          }
        }
      } else if (voteType === 'down') {
        if (hasDownvoted) {
          newDownvoted = currentDownvoted.filter(uid => uid !== user.uid);
          newTotalVotes += 1;
        } else {
          newDownvoted = [...currentDownvoted, user.uid];
          if (hasUpvoted) {
            newUpvoted = currentUpvoted.filter(uid => uid !== user.uid);
            newTotalVotes -= 2;
          } else {
            newTotalVotes -= 1;
          }
        }
      }
  
      await updateDoc(doubtRef, {
        upvotedBy: newUpvoted,
        downvotedBy: newDownvoted,
        totalVotes: newTotalVotes,
      });
  
      setDoubts(prevDoubts =>
        prevDoubts.map(d =>
          d.id === doubtId
            ? {
                ...d,
                upvotedBy: newUpvoted,
                downvotedBy: newDownvoted,
                totalVotes: newTotalVotes,
              }
            : d
        )
      );
  
      notifications.show({
        title: 'Success',
        message: voteType === 'up' ? 'Doubt upvoted' : 'Doubt downvoted',
        color: 'green',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Error updating votes:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update vote. Please try again.',
        color: 'red',
      });
    }
  };
  

  const handleSavePost = (doubt) => {
    if (!user) {
      notifications.show({
        title: 'Authentication required',
        message: 'Please log in to save posts',
        color: 'blue',
      });
      return;
    }
    
    notifications.show({
      title: 'Post saved',
      message: 'This post has been added to your bookmarks',
      color: 'green',
      autoClose: 2000,
    });
  };

  const handleShare = (doubt) => {
    // Copy the URL to clipboard
    const shareUrl = `${window.location.origin}/feed/${doubt.id}`;
    navigator.clipboard.writeText(shareUrl);
    
    notifications.show({
      title: 'Link copied',
      message: 'Share link copied to clipboard',
      color: 'green',
      autoClose: 2000,
    });
  };
  
  // Upload image to Cloudinary
  const uploadImage = async (file) => {
    if (!file) return null;
    
    setUploadingImage(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      setUploadProgress(50);
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      setUploadProgress(100);
      
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image. Please try again.',
        color: 'red',
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Function to handle edit doubt
  const handleEditDoubt = async () => {
    if (!editDoubtId) return;
    
    try {
      const doubtRef = doc(db, 'doubts', editDoubtId);
      
      // Prepare the update data
      const updateData = {
        title: editTitle,
        description: editDescription,
        updatedAt: serverTimestamp()
      };
      
      // If there's a new image, upload it
      if (editImage && typeof editImage !== 'string') {
        const imageUrl = await uploadImage(editImage);
        if (imageUrl) {
          updateData.imageURL = imageUrl;
        }
      }
      
      // Update the document
      await updateDoc(doubtRef, updateData);
      
      // Update the local state
      setDoubts(prevDoubts => 
        prevDoubts.map(doubt => 
          doubt.id === editDoubtId 
            ? {
                ...doubt,
                title: editTitle,
                description: editDescription,
                imageURL: editImage && typeof editImage !== 'string' ? updateData.imageURL : doubt.imageURL
              }
            : doubt
        )
      );
      
      // Close the edit modal
      setEditDoubtId(null);
      
      notifications.show({
        title: 'Success',
        message: 'Doubt updated successfully!',
        color: 'green',
      });
    } catch (error) {
      console.error('Error updating doubt:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update doubt. Please try again.',
        color: 'red',
      });
    }
  };
  
  // Function to handle delete doubt
  const handleDeleteDoubt = async () => {
    if (!deleteDoubtId) return;
    
    try {
      // Delete the comments subcollection first
      const commentsRef = collection(db, 'doubts', deleteDoubtId, 'comments');
      const commentsSnapshot = await getDocs(commentsRef);
      
      const deletePromises = commentsSnapshot.docs.map(commentDoc => 
        deleteDoc(doc(db, 'doubts', deleteDoubtId, 'comments', commentDoc.id))
      );
      
      await Promise.all(deletePromises);
      
      // Now delete the doubt document
      await deleteDoc(doc(db, 'doubts', deleteDoubtId));
      
      // Update the local state
      setDoubts(prevDoubts => prevDoubts.filter(doubt => doubt.id !== deleteDoubtId));
      
      // Reset the delete state
      setDeleteDoubtId(null);
      
      // Show success notification
      notifications.show({
        title: 'Success',
        message: 'Doubt deleted successfully!',
        color: 'green',
      });
    } catch (error) {
      console.error('Error deleting doubt:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete doubt. Please try again.',
        color: 'red',
      });
    }
  };
  
  // Open edit modal with doubt data
  const openEditModal = (doubt) => {
    setEditDoubtId(doubt.id);
    setEditTitle(doubt.title);
    setEditDescription(doubt.description);
    setEditImage(doubt.imageURL);
  };

  // Define inline styles since createStyles is not available
  const styles = {
    appContainer: {
      backgroundColor: '#1A1B1E', // dark[9] equivalent
      minHeight: '100vh',
      color: '#C1C2C5', // gray[1] equivalent
    },
    wrapper: {
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px',
      backgroundColor: '#25262B', // dark[7] equivalent
      borderRadius: '8px',
      transition: 'background-color 200ms ease',
      marginTop: '8px',
      marginBottom: '8px',
    },
    image: {
      maxWidth: 300,
      height: 200,
      objectFit: 'cover',
      borderRadius: '8px',
      marginLeft: '24px',
    },
    title: {
      color: '#F8F9FA', // gray[0] equivalent
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.2,
      marginBottom: '8px',
    },
    placeholder: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2C2E33', // dark[6] equivalent
      borderRadius: '8px',
      height: 200,
      width: 300,
      marginLeft: '24px',
    },
    metadata: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '8px',
      flexWrap: 'wrap',
    },
    sortingPaper: {
      border: '1px solid #373A40', // dark[5] equivalent
      backgroundColor: '#1A1B1E', // dark[8] equivalent
    },
    doubtCard: {
      border: '1px solid #373A40', // dark[5] equivalent
      transition: 'all 0.2s ease',
      backgroundColor: '#1A1B1E', // dark[8] equivalent
    },
    voteButton: {
      '&:hover': {
        backgroundColor: '#373A40', // dark[5] equivalent
      }
    },
    commentButton: {
      backgroundColor: '#3B1B6C', // violet[9] equivalent
      color: '#E4CCF7', // violet[1] equivalent
    },
    skeleton: {
      // These styles will be applied via className
    }
  };

  // Get unique categories for tabs
  const categories = ['all', ...new Set(doubts.map(doubt => doubt.category?.toLowerCase()).filter(Boolean))];
  const { doubtId } = useParams(); 
  return (
    // Wrap the entire app in MantineProvider with dark theme to ensure consistent colors
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <div style={styles.appContainer}>
        <div >
          <Navbar />
        </div>
        <div className="flex-1 md:ml-[300px] p-4">
          <Container size="lg">
            <Paper 
              shadow="sm" 
              p="md" 
              radius="md" 
              mb="xl" 
              withBorder 
              style={styles.sortingPaper}
            >
              <Group justify="space-between" wrap="nowrap" mb="md">
                <Title order={2} size="h3" c="gray.0" fw={700}>
                  <Group gap={8}>
                    <ThemeIcon variant="light" size="lg" radius="xl" color="violet.7">
                      <IconFileChart style={{ width: rem(18), height: rem(18) }} />
                    </ThemeIcon>
                    <Text span>Doubts Feed</Text>
                  </Group>
                </Title>

                <Group>
                  <Tooltip label="Toggle filters">
                    <ActionIcon
                      variant="light"
                      color="violet.7"
                      onClick={toggleFilters}
                      radius="xl"
                    >
                      <IconFilter style={{ width: rem(16), height: rem(16) }} />
                    </ActionIcon>
                  </Tooltip>

                  <Select
                    size={isMobile ? "xs" : "sm"}
                    value={sortBy}
                    onChange={setSortBy}
                    data={[
                      { value: 'latest', label: 'Latest' },
                      { value: 'hot', label: 'Hot' },
                      { value: 'relevant', label: 'Relevant for you' },
                    ]}
                    leftSection={
                      sortBy === 'latest' ? <IconClockHour4 size={16} color="#d0bfff" /> :
                      sortBy === 'hot' ? <IconFlame size={16} color="#ff6b6b" /> :
                      <IconUserCheck size={16} color="#69db7c" />
                    }
                    styles={{
                      input: {
                        backgroundColor: 'var(--mantine-color-dark-6)',
                        borderColor: 'var(--mantine-color-dark-4)',
                        color: 'var(--mantine-color-gray-0)',
                      },
                      dropdown: {
                        backgroundColor: 'var(--mantine-color-dark-7)',
                        borderColor: 'var(--mantine-color-dark-4)',
                      },
                      item: {
                        color: 'var(--mantine-color-gray-0)',
                        '&[data-hovered]': {
                          backgroundColor: 'var(--mantine-color-dark-5)',
                        },
                        '&[data-selected]': {
                          backgroundColor: 'var(--mantine-color-violet-8)',
                          color: 'var(--mantine-color-gray-0)',
                        }
                      },
                    }}
                    withCheckIcon={false}
                  />
                </Group>
              </Group>

              <Transition mounted={filtersOpened} transition="slide-down">
                {(transitionStyles) => (
                  <Box style={transitionStyles} mb="md">
                    <ScrollArea>
                      <Tabs 
                        value={activeTab} 
                        onChange={setActiveTab}
                        variant="pills"
                        radius="xl"
                        color="violet"
                      >
                        <Tabs.List>
                          {categories.map(category => (
                            <Tabs.Tab 
                              key={category} 
                              value={category}
                              leftSection={category === 'all' ? 
                                <IconFilter style={{ width: rem(16), height: rem(16) }} /> : null
                              }
                            >
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Tabs.Tab>
                          ))}
                        </Tabs.List>
                      </Tabs>
                    </ScrollArea>
                  </Box>
                )}
              </Transition>
            </Paper>

            {loading ? (
              Array(3).fill(0).map((_, i) => <LoadingSkeleton key={i} />)
            ) : doubts.length > 0 ? (
              <Grid>
                {doubts.map((doubt) => (
                  <Grid.Col key={doubt.id} span={{ base: 12, md: 12 }}>
                    <Transition mounted={true} transition="fade" duration={400}>
                      {(transitionStyles) => (
                        <Card 
                          shadow="sm" 
                          padding="lg" 
                          radius="md" 
                          withBorder 
                          style={{...transitionStyles, ...styles.doubtCard}}
                        >
                          <Card.Section withBorder inheritPadding py="xs" bg="dark.7">
                            <Group justify="space-between" wrap="nowrap">
                              <Group wrap="nowrap">
                                <Indicator 
                                  inline 
                                  size={12} 
                                  offset={4} 
                                  position="bottom-end" 
                                  color="green" 
                                  withBorder
                                  disabled={doubt.isAnonymous}
                                >
                                  <Avatar 
                                    size={36} 
                                    radius="xl"
                                    color="violet.8"
                                    bg="violet.9"
                                  >
                                    {doubt.isAnonymous ? 'A' : doubt.email?.[0]?.toUpperCase()}
                                  </Avatar>
                                </Indicator>
                                <div>
                                  <Text className='flex-1 flex items-start' size="sm" fw={600} c="gray.0">
                                    {doubt.isAnonymous ? 'Anonymous' : doubt.email}
                                  </Text>
                                  <Text className='flex-1 flex items-start' size="xs" c="gray.5">
                                    {doubt.createdAt ? formatDistanceToNow(doubt.createdAt, { addSuffix: true }) : 'Recently'}
                                  </Text>
                                </div>
                              </Group>
                              <Menu shadow="md" width={200} position="bottom-end">
                                <Menu.Target>
                                  <ActionIcon variant="subtle" size="sm" color="gray.5" radius="xl">
                                    <IconDots style={{ width: rem(16), height: rem(16) }} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown bg="dark.7" borderColor="dark.4">
                                  {/* Show edit and delete options only if user is the author and not anonymous */}
                                  {user && (doubt.userId === user.uid || doubt.postedBy === `/users/${user.uid}`) && !doubt.isAnonymous && (
                                    <>
                                      <Menu.Item 
                                        leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} color="#d0bfff" />}
                                        c="gray.0"
                                        onClick={() => openEditModal(doubt)}
                                      >
                                        Edit doubt
                                      </Menu.Item>
                                      <Menu.Item 
                                        leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} color="#ff6b6b" />}
                                        c="red.5"
                                        onClick={() => setDeleteDoubtId(doubt.id)}
                                      >
                                        Delete doubt
                                      </Menu.Item>
                                      <Menu.Divider />
                                    </>
                                  )}
                                  {/* <Menu.Item 
                                    leftSection={<IconBookmark style={{ width: rem(14), height: rem(14) }} color="#d0bfff" />}
                                    c="gray.0"
                                    onClick={() => handleSavePost(doubt)}
                                  >
                                    Save post
                                  </Menu.Item> */}
                                  <Menu.Item 
                                    leftSection={<IconShare style={{ width: rem(14), height: rem(14) }} color="#d0bfff" />}
                                    c="gray.0"
                                    onClick={() => handleShare(doubt)}
                                  >
                                    Share
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Group>
                          </Card.Section>

                          <UnstyledButton 
                            style={styles.wrapper}
                            component="div"
                            onClick={()=> navigate(`/feed/${doubt.id}`)}
                          >
                            <div>
                              <Text 
                                fw={700} 
                                size="lg" 
                                mt="md" 
                                mb="xs" 
                                style={styles.title}
                              >
                                {doubt.title}
                              </Text>

                              <Text size="sm" c="gray.2" lineClamp={3}>
                                {doubt.description || 'No description provided'}
                              </Text>

                              <div style={styles.metadata}>
                                <Badge 
                                  size="sm" 
                                  variant="filled" 
                                  color="violet.9"
                                  tt="none"
                                  radius="sm"
                                >
                                  {doubt.category}
                                </Badge>
                                {doubt.tags?.map(tag => (
                                  <Badge 
                                    key={tag} 
                                    size="sm" 
                                    variant="light" 
                                    color="gray.6"
                                    tt="none"
                                    radius="sm"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {doubt.imageURL && (
                              <Image
                                src={doubt.imageURL}
                                alt="Doubt image"
                                style={styles.image}
                                radius="md"
                              />
                            )}

                            {!doubt.imageURL && doubt.description?.length > 100 && (
                              <div style={styles.placeholder}>
                                <IconPhoto style={{ width: rem(40), height: rem(40) }} color="#5c5f66" />
                              </div>
                            )}
                          </UnstyledButton>

                          <Divider my="sm" color="dark.6" />

                          <Flex justify="space-between" align="center">
                            <Group gap="xs">
                              <Tooltip label={user ? "Upvote" : "Login to vote"}>
                                <ActionIcon 
                                  variant="subtle" 
                                  onClick={() => handleVote(doubt.id, 'up')}
                                  disabled={!user}
                                  className={classes.voteButton}
                                  data-active={doubt.upvotedBy?.includes(user?.uid)}
                                  color="violet"
                                  radius="xl"
                                  size="md"
                                >
                                  <IconArrowUp style={{ width: rem(18), height: rem(18) }} />
                                </ActionIcon>
                              </Tooltip>
                              <Text size="sm" fw={600} c="gray.0">{doubt.totalVotes || 0}</Text>
                              <Tooltip label={user ? "Downvote" : "Login to vote"}>
                                <ActionIcon 
                                  variant="subtle" 
                                  onClick={() => handleVote(doubt.id, 'down')}
                                  disabled={!user}
                                  className={classes.voteButton}
                                  data-active={doubt.downvotedBy?.includes(user?.uid)}
                                  color="violet"
                                  radius="xl"
                                  size="md"
                                >
                                  <IconArrowDown style={{ width: rem(18), height: rem(18) }} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>

                            <Group>
                              {/* <ActionIcon
                                variant="subtle"
                                color="violet"
                                radius="xl"
                                className={classes.voteButton}
                                onClick={() => handleSavePost(doubt)}
                              >
                                <IconHeart style={{ width: rem(18), height: rem(18) }} />
                              </ActionIcon> */}

                              <Button 
                                variant="light"
                                size="xs"
                                color="violet.6"
                                leftSection={<IconMessageCircle style={{ width: rem(14), height: rem(14) }} />}
                                style={styles.commentButton}
                                radius="xl"
                                onClick={()=> navigate(`/feed/${doubt.id}`)}
                              >
                                
                                {
                                doubt.commentCount || 0} Comments
                              </Button>
                              {/* {console.log(doubt.commentCount)} */}
                            </Group>
                          </Flex>
                        </Card>
                      )}
                    </Transition>
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Paper 
                p="xl" 
                radius="md" 
                withBorder 
                style={styles.doubtCard}
                ta="center"
              >
                <ThemeIcon size={64} radius={100} color="violet.9" mb="md">
                  <IconMessage size={36} />
                </ThemeIcon>
                <Title order={3} mb="xs" c="gray.0">No doubts found</Title>
                <Text c="gray.2" maw={400} mx="auto" mb="md">
                  There are no doubts in this category yet. Be the first to post a question!
                </Text>
                <Button 
                  variant="filled" 
                  color="violet.7" 
                  leftSection={<IconMessage size={14} />}
                  radius="xl"
                  onClick={()=> {navigate('/postdoubt')}}
                >
                  Create a doubt
                </Button>
              </Paper>
            )}
          </Container>
        </div>
      </div>
      
      {/* Edit Doubt Modal */}
      <Modal
        opened={editDoubtId !== null}
        onClose={() => setEditDoubtId(null)}
        title="Edit Doubt"
        size="lg"
        centered
      >
        <Stack spacing="md">
          <TextInput
            label="Title"
            placeholder="Doubt title"
            value={editTitle}
            onChange={(event) => setEditTitle(event.currentTarget.value)}
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Describe your doubt in detail"
            value={editDescription}
            onChange={(event) => setEditDescription(event.currentTarget.value)}
            minRows={4}
            required
          />
          
          {editDoubtId && doubts.find(d => d.id === editDoubtId)?.type === 'image' && (
            <div>
              <Text size="sm" weight={500} mb="xs">
                Image
              </Text>
              
              {editImage ? (
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <Image
                    src={typeof editImage === 'string' ? editImage : URL.createObjectURL(editImage)}
                    alt="Doubt image"
                    radius="md"
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                  <Button
                    size="xs"
                    color="red"
                    variant="filled"
                    style={{ position: 'absolute', top: 5, right: 5 }}
                    onClick={() => setEditImage(null)}
                  >
                    <IconTrash size={14} />
                  </Button>
                </div>
              ) : (
                <FileButton
                  onChange={setEditImage}
                  accept="image/png,image/jpeg"
                >
                  {(props) => (
                    <Button {...props} variant="outline" leftIcon={<IconPhoto size={14} />}>
                      Upload Image
                    </Button>
                  )}
                </FileButton>
              )}
            </div>
          )}
          
          {uploadingImage && (
            <Progress value={uploadProgress} size="sm" color="violet" />
          )}
          
          <Group position="right" mt="md">
            <Button variant="outline" onClick={() => setEditDoubtId(null)}>
              Cancel
            </Button>
            <Button color="violet" onClick={handleEditDoubt} loading={uploadingImage}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteDoubtId !== null}
        onClose={() => setDeleteDoubtId(null)}
        title="Delete Doubt"
        size="md"
        centered
      >
        <Text mb="lg">
          Are you sure you want to delete this doubt? This action cannot be undone.
        </Text>
        <Group position="right">
          <Button variant="outline" onClick={() => setDeleteDoubtId(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteDoubt}>
            Delete
          </Button>
        </Group>
      </Modal>
    </MantineProvider>
  );
}

const LoadingSkeleton = () => (
  <Paper shadow="sm" p="md" radius="md" mb="md" style={styles.doubtCard}>
    <Group justify="space-between" mb="md">
      <Group>
        <Skeleton height={40} width={40} radius="xl" className={classes.skeleton} />
        <div>
          <Skeleton height={18} width={120} radius="md" mb={8} className={classes.skeleton} />
          <Skeleton height={12} width={80} radius="md" className={classes.skeleton} />
        </div>
      </Group>
      <Skeleton height={24} width={24} radius="md" className={classes.skeleton} />
    </Group>
    <Skeleton height={24} width="70%" radius="md" mb="sm" className={classes.skeleton} />
    <Skeleton height={60} radius="md" mb="sm" className={classes.skeleton} />
    <Group mb="md">
      <Skeleton height={20} width={60} radius="sm" className={classes.skeleton} />
      <Skeleton height={20} width={50} radius="sm" className={classes.skeleton} />
    </Group>
    <Divider my="xs" color="dark.4" />
    <Group>
      <Skeleton height={24} width={80} radius="md" className={classes.skeleton} />
      <Skeleton height={24} width={100} radius="md" className={classes.skeleton} />
    </Group>
  </Paper>
);