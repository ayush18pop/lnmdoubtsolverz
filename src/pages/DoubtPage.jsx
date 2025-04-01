import React, { useState, useEffect } from 'react';
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
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Navbar from '../components/Navbar';
// Import icons (using Tabler icons as an example)
import {
  IconArrowUp,
  IconArrowDown,
  IconShare,
  IconBookmark,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { notifications } from '@mantine/notifications';

function DoubtPage() {
  const { id } = useParams(); // extract doubt id from URL
  const [loading, setLoading] = useState(true);
  const [doubt, setDoubt] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  // You can add a state for newCommentImage if you support image uploads in comments
  const { user } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const styles = {
    appContainer: {
      backgroundColor: '#1A1B1E',
      minHeight: '100vh',
      color: '#C1C2C5',
    },
    doubtCard: {
      border: '1px solid #373A40',
      backgroundColor: '#1A1B1E',
      padding: '16px',
      borderRadius: '8px',
    },
    title: {
      color: '#F8F9FA',
      fontWeight: 700,
      marginBottom: '8px',
    },
    image: {
      maxWidth: 500,
      borderRadius: '8px',
      marginTop: '16px',
    },
    commentCard: {
      border: '1px solid #373A40',
      backgroundColor: '#25262B',
      padding: '12px',
      borderRadius: '8px',
    },
  };

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
        };
        setDoubt(doubtData);
      } else {
        console.log('No such doubt exists!');
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
      const q = query(commentsRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      const commentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching comments: ', err);
    }
  };

  // Function to post a new comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return; // ignore empty comments
    try {
      const commentsRef = collection(db, 'doubts', id, 'comments');
      await addDoc(commentsRef, {
        text: newComment,
        author: user?.email || 'Anonymous',
        // Optionally store an image URL if the comment includes an image
        // imageURL: <image url if uploaded>,
        timestamp: serverTimestamp(),
      });
      setNewComment('');
      fetchComments(); // refresh comments list after posting
    } catch (err) {
      console.error('Error posting comment: ', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to post comment. Please try again.',
        color: 'red',
      });
    }
  };

  // Dummy handlers for vote, share, and save. Replace with your actual implementations.
  const handleVote = (type) => {
    console.log(`Vote: ${type} for doubt id ${doubt.id}`);
  };

  const handleShare = () => {
    console.log(`Share doubt id ${doubt.id}`);
  };

  const handleSavePost = () => {
    console.log(`Save doubt id ${doubt.id}`);
  };

  // Fetch doubt and comments when component mounts or id changes
  useEffect(() => {
    if (id) {
      fetchDoubt();
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <div style={styles.appContainer}>
        <div className="hidden md:block">
          <Navbar />
        </div>
        <div className='flex-1 md:ml-[300px] p-4'>
        <Container size="lg" style={{ padding: '16px' }} >
          <Paper shadow="sm" p="md" radius="md" withBorder style={styles.doubtCard}>
            {loading ? (
              <Loader />
            ) : doubt ? (
              <>
                {/* Doubt Header */}
                <Title order={2} style={styles.title}>
                  {doubt.title}
                </Title>
                <Text size="sm" mb="md">
                  {doubt.description}
                </Text>
                {doubt.imageURL && (
                  <Image src={doubt.imageURL} alt="Doubt image" style={styles.image} radius="md" />
                )}

                {/* Upvote, Downvote, Share, Save Buttons */}
                <Group mt="md" mb="md">
                  <ActionIcon
                    variant="subtle"
                    onClick={() => handleVote('up')}
                    color="violet"
                    radius="xl"
                    size="lg"
                  >
                    <IconArrowUp size={18} />
                  </ActionIcon>
                  <Text size="sm" fw={600}>
                    {doubt.totalVotes || 0}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    onClick={() => handleVote('down')}
                    color="violet"
                    radius="xl"
                    size="lg"
                  >
                    <IconArrowDown size={18} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" onClick={handleShare} color="violet" radius="xl" size="lg">
                    <IconShare size={18} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" onClick={handleSavePost} color="violet" radius="xl" size="lg">
                    <IconBookmark size={18} />
                  </ActionIcon>
                </Group>

                <Divider my="sm" />

                {/* Comments Section */}
                <Title order={3} mb="xs" style={{ color: '#F8F9FA' }}>
                  Comments
                </Title>
                <Stack spacing="sm" mb="md">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <Paper key={comment.id} p="sm" radius="md" withBorder style={styles.commentCard}>
                        <Group position="apart">
                          <Text size="sm" fw={500}>
                            {comment.author}
                          </Text>
                          <Text size="xs" c="gray.5">
                            {comment.timestamp
                              ? formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true })
                              : 'Just now'}
                          </Text>
                        </Group>
                        <Text size="sm">{comment.text}</Text>
                        {comment.imageURL && (
                          <Image
                            src={comment.imageURL}
                            alt="Comment image"
                            style={{ maxWidth: 200, borderRadius: 8, marginTop: 8 }}
                          />
                        )}
                      </Paper>
                    ))
                  ) : (
                    <Text>No comments yet. Be the first to comment!</Text>
                  )}
                </Stack>

                {/* New Comment Input */}
                <Group align="flex-end" mt="md">
                  <Textarea
                    placeholder="Write your comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    autosize
                    minRows={2}
                    style={{ flex: 1 }}
                  />
                  <Button onClick={handlePostComment} color="violet">
                    Post
                  </Button>
                </Group>
              </>
            ) : (
              <Text>Doubt not found.</Text>
            )}
          </Paper>
        </Container>
        </div>
      </div>
    </MantineProvider>
  );
}

export default DoubtPage;
