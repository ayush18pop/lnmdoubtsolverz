import {
  Button,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Tabs,
  rem,
  Container,
  Box,
  Flex,
  Group,
  List,
  ThemeIcon,
  Overlay,
  SimpleGrid,
  Stack,
  Card,
  Image,
  Modal,
  BackgroundImage,
  Divider,
  Badge,
  Tooltip,
  Avatar,
  Center,
  ScrollArea,
} from "@mantine/core";
import { 
  IconLock, 
  IconMail, 
  IconCheck, 
  IconArrowRight, 
  IconBrandGithub,
  IconBrandGoogle,
  IconQuestionMark,
  IconBulb,
  IconBell,
  IconBook,
  IconUsers,
  IconMessage,
  IconArrowUp,
  IconChevronRight,
  IconMessageDots,
  IconSearch,
  IconPlus,
  IconUser,
  IconThumbUp
} from '@tabler/icons-react';
import { useState, useEffect } from "react";
import { loginUser, signupUser, clearError } from "../store/authSlice";
import { useDisclosure } from '@mantine/hooks';
import { useDispatch, useSelector } from "react-redux";
import classes from "./AuthPage.module.css";
import { useNavigate } from "react-router-dom";
import { validateLNMIITEmail } from "../utils/validation";

export function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const { loading, error: authError, isAuthenticated } = useSelector((state) => state.auth);
  const [isVisible, setIsVisible] = useState(false);

  // Set visibility after a small delay for entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Clear errors when component unmounts or tab changes
  useEffect(() => {
    dispatch(clearError());
    setFormError("");
  }, [dispatch, activeTab]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/feed');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    setFormError("");
    
    const emailValidation = validateLNMIITEmail(formData.email);
    if (!emailValidation.isValid) {
      setFormError(emailValidation.message);
      return false;
    }

    if (!formData.email || !formData.password) {
      setFormError("All fields are required");
      return false;
    }

    if (formData.password.length < 6) {
      setFormError("Password needs at least 6 chars");
      return false;
    }

    if (activeTab === 'register' && formData.password !== formData.confirmPassword) {
      setFormError("Passwords don't match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    dispatch(clearError());
    
    if (validateForm()) {
      try {
        if (activeTab === 'login') {
          await dispatch(loginUser({ 
            email: formData.email, 
            password: formData.password 
          })).unwrap();
        } else {
          await dispatch(signupUser({ 
            email: formData.email, 
            password: formData.password 
          })).unwrap();
        }
      } catch (err) {
        console.error('Authentication failed:', err);
      }
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const iconStyle = { width: rem(18), height: rem(18) };
  
  const features = [
    {
      icon: <IconMessageDots size={rem(30)} stroke={1.5} />,
      title: 'Doubt Feed',
      description: 'Browse & solve doubts in real-time. Get instant help from your peers on coding, math & more.',
    },
    {
      icon: <IconQuestionMark size={rem(30)} stroke={1.5} />,
      title: 'Post Your Doubt',
      description: 'Stuck on a problem? Post it with ease and watch as solutions roll in from helpful peers.',
    },
    {
      icon: <IconBell size={rem(30)} stroke={1.5} />,
      title: 'Instant Notifications',
      description: 'Never miss an answer again. Get notified the moment someone responds to your doubt. (Coming soon)',
    },
    {
      icon: <IconBook size={rem(30)} stroke={1.5} />,
      title: 'Resource Hub',
      description: 'Access a curated collection of study materials, notes, and solutions all in one place. (Coming soon)',
    },
    {
      icon: <IconUsers size={rem(30)} stroke={1.5} />,
      title: 'Community Driven',
      description: 'Connect with peers, share knowledge, and build a strong network with fellow students.',
    },
  ];

  const mockPosts = [
    {
      id: 1,
      avatar: 'A',
      user: '23ucs123@lnmiit.ac.in',
      time: '20m ago',
      title: 'Need help with OS Memory Management',
      content: 'I\'m struggling to understand memory fragmentation in OS. Can someone explain how to calculate internal & external fragmentation?',
      tags: ['OS', 'Academic'],
      upvotes: 5,
      comments: 2
    },
    {
      id: 2,
      avatar: 'S',
      user: '22uce045@lnmiit.ac.in', 
      time: '1h ago',
      title: 'React Router v6 issue',
      content: 'Getting an error with nested routes in React Router v6. Any idea what\'s wrong with my setup?',
      tags: ['React', 'Coding'],
      upvotes: 3,
      comments: 1
    }
  ];

  return (
    <div className={classes.landingWrapper} style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.8s ease-out' }}>
      {/* Hero Section */}
      <div className={classes.hero}>
        <Container size="xl">
          {/* <SimpleGrid cols={{ base: 1, md: 2 }} spacing={50}> */}
            <div className={classes.heroContent}>
              <Title className={classes.title}>Welcome to LNMDoubts</Title>
              <Text className={classes.subtitle}>
                Anytime, Anywhere, by Your Fellow Students
              </Text>
              <Text className={classes.description}>
                LNMDoubts connects you with a community of students ready to help. Post your questions, 
                get answers, and share knowledge in a collaborative space built for LNMIIT students.
              </Text>
              <Group justify="center">
                <Button 
                  size="lg" 
                  className={classes.ctaButton}
                  onClick={open}
                  rightSection={<IconArrowRight size={18} />}
                >
                  Ask a Doubt Now
                </Button>
                <Button 
                  component="a" 
                  href="https://github.com/ayush18pop/lnmdoubtsolverz" 
                  target="_blank"
                  size="lg" 
                  variant="outline" 
                  className={classes.secondaryButton}
                  leftSection={<IconBrandGithub size={18} />}
                >
                  GitHub
                </Button>
              </Group>
            </div>
            {/* <div className={classes.heroImage}>
              <Image 
                src="https://img.freepik.com/free-vector/college-students-concept-illustration_114360-10205.jpg?w=740&t=st=1710867180~exp=1710867780~hmac=95bbfcd614a9a1093f0b4c3c68d08a7cdc9f8fd11e307d8797545958e907640c"
                alt="LNMDoubts platform illustration"
                className={classes.mainImage}
              />
            </div> */}
          {/* </SimpleGrid> */}
        </Container>
      </div>

      {/* Stats Section */}
      {/* <div className={classes.statsSection}>
        <Container>
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing={30}>
            <div className={classes.statItem}>
              <Text className={classes.statValue}>1,000+</Text>
              <Text className={classes.statLabel}>Doubts Solved</Text>
            </div>
            <div className={classes.statItem}>
              <Text className={classes.statValue}>500+</Text>
              <Text className={classes.statLabel}>Active Users</Text>
            </div>
            <div className={classes.statItem}>
              <Text className={classes.statValue}>15+</Text>
              <Text className={classes.statLabel}>Subjects Covered</Text>
            </div>
            <div className={classes.statItem}>
              <Text className={classes.statValue}>24/7</Text>
              <Text className={classes.statLabel}>Support</Text>
            </div>
          </SimpleGrid>
        </Container>
      </div> */}

      {/* How It Works Section */}
      <Container size="lg" className={classes.howItWorksSection}>
        <Title order={2} className={classes.sectionTitle} ta="center">
          How It Works
        </Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing={30}>
          <div className={classes.stepCard}>
            <ThemeIcon size={60} radius={60} className={classes.stepIcon}>
              <Text size={24}>1</Text>
            </ThemeIcon>
            <Text className={classes.stepTitle}>
              Sign Up
            </Text>
            <Text size="sm" c="dimmed">
              Create your account with your LNMIIT email in just 30 seconds
            </Text>
          </div>
          <div className={classes.stepCard}>
            <ThemeIcon size={60} radius={60} className={classes.stepIcon}>
              <Text size={24}>2</Text>
            </ThemeIcon>
            <Text className={classes.stepTitle}>
              Post Your Doubt
            </Text>
            <Text size="sm" c="dimmed">
              Share your question with details to get the best possible answers
            </Text>
          </div>
          <div className={classes.stepCard}>
            <ThemeIcon size={60} radius={60} className={classes.stepIcon}>
              <Text size={24}>3</Text>
            </ThemeIcon>
            <Text className={classes.stepTitle}>
              Get Solutions
            </Text>
            <Text size="sm" c="dimmed">
              Receive helpful solutions from peers and upvote the best answers
            </Text>
          </div>
        </SimpleGrid>
      </Container>

      {/* Features Section */}
      <Container size="lg" className={classes.featuresSection}>
        <Title order={2} className={classes.sectionTitle} ta="center">
          Key Features
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={30}>
          {features.map((feature, index) => (
            <Card key={index} className={classes.featureCard} p="lg" radius="md" withBorder>
              <ThemeIcon size={50} radius={50} className={classes.featureIcon}>
                {feature.icon}
              </ThemeIcon>
              <Text className={classes.featureTitle}>
                {feature.title}
              </Text>
              <Text size="sm" c="dimmed" className={classes.featureDescription}>
                {feature.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      {/* Mock Feed Preview */}
      <Container size="lg" py={80}>
        <Title order={2} className={classes.sectionTitle} ta="center" mb={50}>
          See What Students Are Discussing
        </Title>
        <Paper radius="md" p={0} style={{ overflow: 'hidden', border: '1px solid rgba(123, 93, 249, 0.2)' }}>
          <Box p="md" style={{ borderBottom: '1px solid rgba(123, 93, 249, 0.2)', background: 'var(--bg-card)' }}>
            <Group position="apart">
              <Group>
                <IconMessageDots size={20} style={{ color: 'var(--primary)' }} />
                <Text fw={600}>Doubt Feed</Text>
              </Group>
              <Group>
                <Button variant="subtle" compact leftIcon={<IconPlus size={18} />}>
                  New Post
                </Button>
                <Button variant="subtle" compact leftIcon={<IconSearch size={18} />}>
                  Search
                </Button>
              </Group>
            </Group>
          </Box>
          
          <ScrollArea h={400} p={0} style={{ background: 'var(--bg-dark)' }}>
            {mockPosts.map((post) => (
              <Box key={post.id} p="md" mb="md" style={{ borderBottom: '1px solid rgba(123, 93, 249, 0.1)' }}>
                <Group position="apart" mb="xs">
                  <Group>
                    <Avatar radius="xl" color="indigo">{post.avatar}</Avatar>
                    <div>
                      <Text size="sm" fw={500}>{post.user}</Text>
                      <Text size="xs" c="dimmed">{post.time}</Text>
                    </div>
                  </Group>
                </Group>
                
                <Text fw={700} size="lg" mb="xs">{post.title}</Text>
                <Text size="sm" mb="sm">{post.content}</Text>
                
                <Group position="apart">
                  <Group spacing="xs">
                    {post.tags.map((tag, i) => (
                      <Badge key={i} variant="filled" color="indigo">{tag}</Badge>
                    ))}
                  </Group>
                  <Group>
                    <Tooltip label="Upvote">
                      <Button variant="subtle" compact leftIcon={<IconThumbUp size={16} />}>
                        {post.upvotes}
                      </Button>
                    </Tooltip>
                    <Tooltip label="Comments">
                      <Button variant="subtle" compact leftIcon={<IconMessage size={16} />}>
                        {post.comments}
                      </Button>
                    </Tooltip>
                  </Group>
                </Group>
              </Box>
            ))}
          </ScrollArea>
        </Paper>
      </Container>

      {/* Footer CTA */}
      <div className={classes.footerCta}>
        <Container size="md" className={classes.ctaContainer}>
          <Title order={2} className={classes.ctaTitle} ta="center">
            Join the Movement Today
          </Title>
          <Text className={classes.ctaText} ta="center">
            Be part of a thriving community of students helping each other succeed.
            It's free, it's easy, and it's the smartest way to study.
          </Text>
          <Group justify="center" spacing="md">
            <Button 
              size="lg" 
              className={classes.ctaButton}
              onClick={open}
            >
              Join LNMDoubts Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className={classes.secondaryButton}
              leftSection={<IconBrandGoogle size={18} />}
            >
              Sign in with Google
            </Button>
          </Group>
        </Container>
      </div>

      {/* Sticky CTA for mobile */}
      <div className={classes.stickyCta}>
        <Button 
          className={classes.ctaButton}
          onClick={open}
          size="md"
        >
          Join Now - It's Free!
        </Button>
      </div>

      {/* Auth Modal */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title="Welcome to LNMDoubts" 
        centered
        size="md"
        overlayProps={{
          blur: 3,
          backgroundOpacity: 0.55,
        }}
      >
        <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
          <Tabs.List grow mb="md">
            <Tabs.Tab value="login">Log In</Tabs.Tab>
            <Tabs.Tab value="register">Sign Up</Tabs.Tab>
          </Tabs.List>

          {(formError || authError) && (
            <Text c="red" ta="center" mb="md">
              {formError || authError}
            </Text>
          )}

          <form onSubmit={handleSubmit}>
            <TextInput
              label="Your LNMIIT Email"
              placeholder="23ucsXXX@lnmiit.ac.in"
              value={formData.email}
              onChange={handleInputChange('email')}
              icon={<IconMail style={iconStyle} />}
              required
              mb="md"
            />

            <PasswordInput
              label="Password"
              placeholder="Your secret code"
              value={formData.password}
              onChange={handleInputChange('password')}
              icon={<IconLock style={iconStyle} />}
              required
              mb="md"
            />

            {activeTab === 'register' && (
              <PasswordInput
                label="Confirm Password"
                placeholder="Type it again"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                icon={<IconLock style={iconStyle} />}
                required
                mb="md"
              />
            )}

            <Button 
              type="submit" 
              fullWidth 
              mt="xl" 
              size="md" 
              loading={loading}
              className={classes.authButton}
            >
              {activeTab === 'login' ? 'Sign in' : 'Create account'}
            </Button>
            
            <Divider label="or continue with" labelPosition="center" my="lg" />
            
            <Button
              variant="outline"
              fullWidth
              leftIcon={<IconBrandGoogle style={iconStyle} />}
              className={classes.secondaryButton}
            >
              Google
            </Button>
          </form>
        </Tabs>
      </Modal>
    </div>
  );
}
