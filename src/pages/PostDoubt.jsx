import { useState } from 'react';
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
  MultiSelect
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconCloudUpload, IconDownload, IconX, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Navbar from '../components/Navbar';

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

  return (
    <div className="flex min-h-screen">
      <div className='hidden md:block'>
        <Navbar />
      </div>
      <div className="flex-1 md:ml-[300px] p-6">
        <Container size="lg">
          {/* <Paper p="xl" radius="md" withBorder> */}
            <Title order={2} mb="xl" className="text-left text-black">Post Your Doubt</Title>

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
                  classNames={{
                    label: 'text-left',
                    input: 'text-left'
                  }}
                />

                <Select
                  label="Category"
                  placeholder="Select a category"
                  data={CATEGORIES}
                  value={category}
                  onChange={setCategory}
                  required
                  classNames={{
                    label: 'text-left',
                    input: 'text-left'
                  }}
                />

                <MultiSelect
                  label="Tags"
                  placeholder="Select tags"
                  data={TAGS}
                  value={tags}
                  onChange={setTags}
                  classNames={{
                    label: 'text-left',
                    input: 'text-left'
                  }}
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
                    classNames={{
                      label: 'text-left',
                      input: 'text-left'
                    }}
                  />
                ) : (
                  <div>
                    {image ? (
                      <Paper p="md" withBorder>
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
                          <Text size="sm" c="dimmed" ta="center">
                            Click the X button to remove the image and upload a different one
                          </Text>
                        </Stack>
                      </Paper>
                    ) : (
                      <Dropzone
                        onDrop={(files) => setImage(files[0])}
                        accept={[MIME_TYPES.jpeg, MIME_TYPES.png]}
                        maxSize={5 * 1024 ** 2}
                        multiple={false}
                      >
                        <Group justify="center">
                          <Dropzone.Accept>
                            <IconDownload size={50} color={theme.colors.violet[6]} stroke={1.5} />
                          </Dropzone.Accept>
                          <Dropzone.Reject>
                            <IconX size={50} color={theme.colors.red[6]} stroke={1.5} />
                          </Dropzone.Reject>
                          <Dropzone.Idle>
                            <IconCloudUpload size={50} stroke={1.5} />
                          </Dropzone.Idle>
                        </Group>

                        <Text ta="center" fw={700} fz="lg" mt="xl">
                          <Dropzone.Accept>Drop image here</Dropzone.Accept>
                          <Dropzone.Reject>Only images under 5MB</Dropzone.Reject>
                          <Dropzone.Idle>Upload an image of your doubt</Dropzone.Idle>
                        </Text>
                      </Dropzone>
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

                {loading && <Progress value={uploadProgress} size="sm" />}

                <Button 
                  type="submit" 
                  fullWidth 
                  size="md" 
                  loading={loading}
                  disabled={loading}
                >
                  Submit Doubt
                </Button>
              </Stack>
            </form>
          {/* </Paper> */}
        </Container>
      </div>
    </div>
  );
}
