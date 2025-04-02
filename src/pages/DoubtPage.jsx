import React, { useState, useEffect, useRef } from 'react';
import { arrayUnion, arrayRemove, updateDoc, increment } from 'firebase/firestore';
import {
  MantineProvider,
  Container,
  Paper,
  Title,
  Text,
  Image,
  Group,
  Divider,
  ActionIcon,
  Loader,
  Textarea,
  Button,
  Stack,
  Avatar,
  Badge,
  Switch,
  Card,
  FileButton,
  Progress,
  ScrollArea,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
  Menu
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase/firebase';
import Navbar from '../components/Navbar';
import {
  IconArrowUp,
  IconArrowDown,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconShare,
  IconBookmark,
  IconMessageCircle,
  IconUpload,
  IconUser,
  IconUserOff,
  IconPhoto,
  IconCheck,
  IconCopy,
  IconCalendar,
  IconArrowBack,
  IconThumbUp,
  IconThumbDown,
  IconArrowUpFromArc,
} from '@tabler/icons-react';
import { formatDistanceToNow, format } from 'date-fns';
import { notifications } from '@mantine/notifications';

function DoubtPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [doubt, setDoubt] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [commentImage, setCommentImage] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const commentInputRef = useRef(null);
  const theme = useMantineTheme();

  // Function to fetch the doubt details
  const fetchDoubt = async () => {
    setLoading(true);
    try {
      const doubtRef = doc(db, 'doubts', id);
      const docSnap = await getDoc(doubtRef);
      if (docSnap.exists()) {
        const doubtData = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          upvotedBy: docSnap.data().upvotedBy || [],
          downvotedBy: docSnap.data().downvotedBy || [],
          totalVotes: docSnap.data().totalVotes || 0,
          commentCount: docSnap.data().commentCount || 0,
        };
        setDoubt(doubtData);
      } else {
        console.log('No such doubt exists!');
        notifications.show({
          title: 'Not Found',
          message: 'The doubt you are looking for does not exist',
          color: 'red',
        });
      }
    } catch (err) {
      console.error('Error fetching the doubt: ', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to load doubt. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch comments from the doubt's subcollection
  const fetchComments = async () => {
    try {
      const commentsRef = collection(db, 'doubts', id, 'comments');
      const q = query(commentsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const commentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching comments: ', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to load comments. Please try again.',
        color: 'red',
      });
    }
  };
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  // Function to upload an image to Firebase Storage
 // Function to upload an image to Cloudinary
const uploadImage = async (file) => {
    if (!file) return null;
    
    setUploadingImage(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    try {
      // Simulating progress since Cloudinary's direct upload doesn't provide progress events
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setUploadProgress(100);
      setUploadingImage(false);
      
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      setUploadingImage(false);
      return null;
    }
  };

  // Function to post a new comment
  const handlePostComment = async () => {
    if (!newComment.trim() && !commentImage) return; // ignore empty comments with no image
    
    if (!user && !isAnonymous) {
      notifications.show({
        title: 'Authentication Required',
        message: 'Please log in to post a comment or enable anonymous commenting',
        color: 'blue',
      });
      return;
    }
    
    try {
      setLoading(true);
      const doubtRef = doc(db, 'doubts', id);
      const commentsRef = collection(db, 'doubts', id, 'comments');
      
      let imageURL = null;
      if (commentImage) {
        imageURL = await uploadImage(commentImage);
      }
      
      const commentData = {
        text: newComment.trim(),
        author: isAnonymous ? 'Anonymous' : user?.displayName || user?.email || 'User',
        authorId: isAnonymous ? null : user?.uid,
        authorPhotoURL: isAnonymous ? null : (user?.photoURL || null), // Add null fallback here
        isAnonymous,
        timestamp: serverTimestamp(),
      };
      
      if (imageURL) {
        commentData.imageURL = imageURL;
      }
      
      await addDoc(commentsRef, commentData);
      await updateDoc(doubtRef, {
        commentCount: increment(1)
      });
      
      setNewComment('');
      setCommentImage(null);
      setUploadProgress(0);
      fetchComments();
      
      notifications.show({
        title: 'Success',
        message: 'Comment posted successfully',
        color: 'green',
      });
    } catch (err) {
      console.error('Error posting comment: ', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to post comment. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async ()=>{

  }

  // Function to handle image selection for comment
  const handleImageSelect = (file) => {
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        notifications.show({
          title: 'Invalid File',
          message: 'Please upload only JPG, PNG, GIF or WebP images',
          color: 'red',
        });
        return;
      }
      
      if (file.size > maxSize) {
        notifications.show({
          title: 'File Too Large',
          message: 'Image size should be less than 5MB',
          color: 'red',
        });
        return;
      }
      
      setCommentImage(file);
    }
  };

  // Function to handle voting
  const handleVote = async (voteType) => {
    if (!user) {
      notifications.show({
        title: 'Authentication Required',
        message: 'Please log in to vote on doubts',
        color: 'blue',
      });
      return;
    }
  
    try {
      const doubtRef = doc(db, 'doubts', id);
      const currentUpvoted = doubt.upvotedBy || [];
      const currentDownvoted = doubt.downvotedBy || [];
      let newUpvoted = [...currentUpvoted];
      let newDownvoted = [...currentDownvoted];
      let newTotalVotes = doubt.totalVotes || 0;
  
      if (voteType === 'up') {
        const hasUpvoted = currentUpvoted.includes(user.uid);
        const hasDownvoted = currentDownvoted.includes(user.uid);
  
        if (hasUpvoted) {
          // Remove upvote
          newUpvoted = currentUpvoted.filter(uid => uid !== user.uid);
          newTotalVotes -= 1;
        } else {
          // Add upvote and remove downvote if exists
          newUpvoted = [...currentUpvoted, user.uid];
          if (hasDownvoted) {
            newDownvoted = currentDownvoted.filter(uid => uid !== user.uid);
            newTotalVotes += 2; // Removing a downvote (+1) and adding an upvote (+1)
          } else {
            newTotalVotes += 1;
          }
        }
      } else if (voteType === 'down') {
        const hasDownvoted = currentDownvoted.includes(user.uid);
        const hasUpvoted = currentUpvoted.includes(user.uid);
  
        if (hasDownvoted) {
          // Remove downvote
          newDownvoted = currentDownvoted.filter(uid => uid !== user.uid);
          newTotalVotes += 1;
        } else {
          // Add downvote and remove upvote if exists
          newDownvoted = [...currentDownvoted, user.uid];
          if (hasUpvoted) {
            newUpvoted = currentUpvoted.filter(uid => uid !== user.uid);
            newTotalVotes -= 2; // Removing an upvote (-1) and adding a downvote (-1)
          } else {
            newTotalVotes -= 1;
          }
        }
      }
  
      // Update the doubt document in Firestore
      await updateDoc(doubtRef, {
        upvotedBy: newUpvoted,
        downvotedBy: newDownvoted,
        totalVotes: newTotalVotes,
      });
  
      // Update local state with new values
      setDoubt({
        ...doubt,
        upvotedBy: newUpvoted,
        downvotedBy: newDownvoted,
        totalVotes: newTotalVotes,
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

  // Function to share the doubt
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      notifications.show({
        title: 'Link Copied',
        message: 'Doubt link copied to clipboard',
        color: 'green',
        autoClose: 2000,
      });
    });
  };

  // Function to save the post
  const handleSavePost = async () => {
    if (!user) {
      notifications.show({
        title: 'Authentication Required',
        message: 'Please log in to save doubts',
        color: 'blue',
      });
      return;
    }
    
    try {
      // Implement your save logic here
      notifications.show({
        title: 'Saved',
        message: 'Doubt saved to your bookmarks',
        color: 'green',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Error saving doubt:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save doubt. Please try again.',
        color: 'red',
      });
    }
  };

  // Fetch doubt and comments when component mounts or id changes
  useEffect(() => {
    if (id) {
      fetchDoubt();
      fetchComments();
    }
  }, [id]);

  // Focus on comment input when user clicks "Reply"
  const focusCommentInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      
      <div  style={{ backgroundColor: '#1A1B1E', minHeight: '100vh', color: '#C1C2C5' }}>
        <div >
          <Navbar />
        </div>
        
        <div className='flex-1 md:ml-[250px] p-4'>
          <Container size="lg" p="md" >
            {loading && !doubt ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader size="xl" variant="dots" color="violet" />
              </div>
            ) : doubt ? (
              <>
                {/* Back Button */}
                <Link  to="/feed" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
                  <Group spacing="xs" >
                    <IconArrowBack size={16} />
                    <Text size="sm" color="dimmed">Back to all doubts</Text>
                  </Group>
                </Link>
                
                <Card shadow="sm" radius="md" withBorder p="lg" style={{ backgroundColor: '#25262B', border: '1px solid #373A40', marginBottom: '24px' }}>
                  {/* Doubt Header with Author Info */}
                  <Group position="apart" mb="xs">
                    <Group>
                      <Avatar 
                        src={doubt.authorPhotoURL} 
                        radius="xl" 
                        color="violet"
                        alt={doubt.authorName || 'User'}
                      >
                        {doubt.authorName?.charAt(0) || 'U'}
                      </Avatar>
                      <div>
                        <Text weight={600} size="sm" color='white' className='flex-1 flex items-start'>
                          {doubt.authorName || doubt.author || 'Anonymous'}
                        </Text>
                        <Group spacing="xs">
                          <IconCalendar size={14} color='gray' className='flex-1 flex items-start'/>
                          <Text size="xs" color="gray" className='flex items-start p-0'>
                            {doubt.createdAt ? format(doubt.createdAt, 'PPp') : 'Recently'}
                          </Text>
                        </Group>
                      </div>
                    </Group>
                    {doubt.subject && (
                      <Badge color="violet" variant="light">
                        {doubt.subject}
                      </Badge>
                    )}
                  </Group>
                  
                  {/* Doubt Title and Content */}
                  <Title className='flex-1 flex items-start' order={2} style={{ color: '#F8F9FA', fontWeight: 700, marginBottom: '16px' }}>
                    {doubt.title}
                  </Title>
                  
                  <Text className='flex-1 flex items-start' size="md" color='white' style={{ whiteSpace: 'pre-wrap', marginBottom: '20px', lineHeight: 1.6 }}>
                    {doubt.description}
                  </Text>
                  
                  {doubt.imageURL && (
                    <div style={{ marginBottom: '20px' }}>
                      <Image 
                        src={doubt.imageURL} 
                        alt="Doubt image" 
                        radius="md"
                        style={{ maxWidth: '100%' }}
                        onClick={() => window.open(doubt.imageURL, '_blank')}
                        sx={{ cursor: 'pointer' }}
                      />
                    </div>
                  )}
                  
                  {/* Action Bar */}
                  <Group position="apart" mt="lg">
                    <Group spacing="xs">
                      <Tooltip label={doubt.upvotedBy?.includes(user?.uid) ? "Remove upvote" : "Upvote"}>
                        <ActionIcon
                          variant={doubt.upvotedBy?.includes(user?.uid) ? "filled" : "subtle"}
                          onClick={() => handleVote('up')}
                          color="violet"
                          radius="xl"
                          size="lg"
                        >
                          <IconArrowUp size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Text size="sm" weight={600} color='white'>
                        {doubt.totalVotes || 0}
                      </Text>
                      <Tooltip label={doubt.downvotedBy?.includes(user?.uid) ? "Remove downvote" : "Downvote"}>
                        <ActionIcon
                          variant={doubt.downvotedBy?.includes(user?.uid) ? "filled" : "subtle"}
                          onClick={() => handleVote('down')}
                          color="violet"
                          radius="xl"
                          size="lg"
                        >
                          <IconArrowDown size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    
                    <Group spacing="xs">
                      <Group spacing="xs">
                        <IconMessageCircle size={18}  color='white'/>
                        <Text size="sm" color='white '>{doubt.commentCount || comments.length}</Text>
                      </Group>
                      
                      <Tooltip label="Copy link">
                        <ActionIcon variant="subtle" onClick={handleShare} color="blue" radius="xl" size="lg">
                          <IconShare size={18} />
                        </ActionIcon>
                      </Tooltip>
                      
                      {/* <Tooltip label="Save doubt">
                        <ActionIcon variant="subtle" onClick={handleSavePost} color="yellow" radius="xl" size="lg">
                          <IconBookmark size={18} />
                        </ActionIcon>
                      </Tooltip> */}
                    </Group>
                  </Group>
                </Card>
                
                {/* Comments Section */}
                <div style={{ marginBottom: '24px' }}>
                  <Group position="apart" mb="md">
                    <Title order={3} style={{ color: '#F8F9FA' }}>
                      Comments ({doubt.commentCount || comments.length})
                    </Title>
                    <Button 
                      variant="subtle" 
                      color="violet" 
                      compact 
                      onClick={focusCommentInput}
                      leftIcon={<IconMessageCircle size={16} />}
                    >
                      Add Comment
                    </Button>
                  </Group>
                  
                  {/* Post Comment Form */}
                  <Card shadow="sm" radius="md" withBorder p="md" style={{ backgroundColor: '#25262B', marginBottom: '24px' }}>
                    <Stack spacing="xs">
                      <Textarea
                        ref={commentInputRef}
                        placeholder="Share your thoughts..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        autosize
                        minRows={2}
                        maxRows={6}
                      />
                      
                      {commentImage && (
                        <div style={{ position: 'relative' }}>
                          <Image 
                            src={URL.createObjectURL(commentImage)} 
                            alt="Comment image preview" 
                            radius="md" 
                            height={150} 
                            fit="contain"
                          />
                          <ActionIcon 
                            color="red" 
                            variant="filled" 
                            radius="xl" 
                            size="sm"
                            style={{ position: 'absolute', top: 5, right: 5 }}
                            onClick={() => setCommentImage(null)}
                          >
                            &times;
                          </ActionIcon>
                        </div>
                      )}
                      
                      {uploadingImage && (
                        <Progress 
                          value={uploadProgress} 
                          color="violet" 
                          size="sm" 
                          label={`${Math.round(uploadProgress)}%`} 
                          striped 
                          animate
                        />
                      )}
                      
                      <Group position="apart">
                        <Group spacing="xs">
                          <FileButton onChange={handleImageSelect} accept="image/png,image/jpeg,image/gif,image/webp">
                            {(props) => (
                              <Tooltip label="Attach image">
                                <ActionIcon variant="subtle" color="gray" size="lg" {...props}>
                                  <IconPhoto size={18} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </FileButton>
                          
                          <Group spacing="xs">
                            <Switch
                              checked={isAnonymous}
                              onChange={(event) => setIsAnonymous(event.currentTarget.checked)}
                              color="violet"
                              size="sm"
                              thumbIcon={
                                isAnonymous ? (
                                  <IconUserOff size={12} stroke={2.5} />
                                ) : (
                                  <IconUser size={12} stroke={2.5} />
                                )
                              }
                            />
                            <Text size="sm" color='white'>Post anonymously</Text>
                          </Group>
                        </Group>
                        
                        <Button 
                          onClick={handlePostComment} 
                          color="violet"
                          disabled={(!newComment.trim() && !commentImage) || uploadingImage}
                          leftIcon={<IconMessageCircle size={16} />}
                          
                        >
                          Post Comment
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                  
                  {/* Comments List */}
                  <ScrollArea style={{ height: '100%' }} offsetScrollbars>
                    <Stack spacing="md">
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <Card key={comment.id} shadow="sm" radius="md" withBorder p="md" style={{ backgroundColor: '#25262B' }}>
                            <Group position="apart" mb="xs">
                              <Group spacing="xs">
                                {comment.isAnonymous ? (
                                  <ThemeIcon color="gray" size="md" radius="xl">
                                    <IconUserOff size={14} />
                                  </ThemeIcon>
                                ) : (
                                  <Avatar 
                                    src={comment.authorPhotoURL} 
                                    radius="xl" 
                                    color="violet" 
                                    size="md"
                                  >
                                    {comment.author?.charAt(0) || 'U'}
                                  </Avatar>
                                )}
                                <div>
                                  <Text weight={500} size="sm" color='white' className='flex-1 flex items-start'>
                                    {comment.author}
                                  </Text>
                                  <Text size="xs" color="gray" className='flex-1 flex items-start'>
                                    {comment.timestamp ? formatDistanceToNow(comment.timestamp, { addSuffix: true }) : 'Just now'}
                                  </Text>
                                </div>
                              </Group>
                              
                            {/* TODO : IMPLEMENT handleEdit and handleDelete first */}

                              {/* {user?.uid === comment.authorId && !comment.isAnonymous && (
                                <Menu position="bottom-end">
                                  <Menu.Target>
                                    <ActionIcon variant="subtle" size="sm">
                                      <IconDotsVertical size={16} />
                                    </ActionIcon>
                                  </Menu.Target>
                                  <Menu.Dropdown>
                                    <Menu.Item icon={<IconEdit size={14} />}>Edit</Menu.Item>
                                    <Menu.Item icon={<IconTrash size={14} />} color="red">Delete</Menu.Item>
                                  </Menu.Dropdown>
                                </Menu>
                              )} */}
                            </Group>
                            
                            <Text size="sm" color='white' className='flex-1 flex items-start mx-5' style={{ whiteSpace: 'pre-wrap', marginTop: '10px', marginBottom: comment.imageURL ? '10px' : '0' }}>
                              {comment.text}
                            </Text>
                            
                            {comment.imageURL && (
                              <Image
                                src={comment.imageURL}
                                alt="Comment image"
                                radius="md"
                                mt="sm"
                                style={{ maxWidth: '100%', cursor: 'pointer' }}
                                onClick={() => window.open(comment.imageURL, '_blank')}
                              />
                            )}
                          </Card>
                        ))
                      ) : (
                        <Card shadow="sm" radius="md" withBorder p="md" style={{ backgroundColor: '#25262B', textAlign: 'center' }}>
                          <Text color='white' size="md" mb="md">No comments yet</Text>
                          <Button 
                            variant="light" 
                            color="violet" 
                            compact 
                            onClick={focusCommentInput}
                          >
                            Be the first to comment
                          </Button>
                        </Card>
                      )}
                    </Stack>
                  </ScrollArea>
                </div>
              </>
            ) : (
              <Card shadow="sm" radius="md" withBorder p="lg" style={{ backgroundColor: '#25262B', textAlign: 'center' }}>
                <Title order={3} style={{ color: '#F8F9FA', marginBottom: '16px' }}>
                  Doubt Not Found
                </Title>
                <Text size="md" mb="lg">
                  The doubt you are looking for does not exist or has been removed.
                </Text>
                <Button component={Link} to="/feed" color="violet">
                  Browse All Doubts
                </Button>
              </Card>
            )}
          </Container>
        </div>
        </div>
      
    </MantineProvider>
  );
}

export default DoubtPage;