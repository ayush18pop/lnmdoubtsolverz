import { motion } from "motion/react";

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
  Switch,
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
  IconThumbUp,
  IconSpy as IconIncognito,
  IconShield,
  IconEyeOff,
  IconBolt,
  IconMessageCircle
} from '@tabler/icons-react';
import { useState, useEffect } from "react";
import { loginUser, signupUser, clearError } from "../store/authSlice";
import { useDisclosure } from '@mantine/hooks';
import { useDispatch, useSelector } from "react-redux";
import classes from "./AuthPage.module.css";
import { useNavigate } from "react-router-dom";
import { validateLNMIITEmail } from "../utils/validation";
import { AuroraBackground } from "./ui/aurora-background";

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
  const [anonymousFeatureHovered, setAnonymousFeatureHovered] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState('regular');

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
      icon: <IconIncognito size={rem(30)} stroke={1.5} className={anonymousFeatureHovered ? classes.pulseIcon : ''} />,
      title: 'Anonymous Mode',
      description: 'Ask sensitive questions with total privacy. Your identity remains hidden while still getting the help you need.',
      highlighted: true,
      onMouseEnter: () => setAnonymousFeatureHovered(true),
      onMouseLeave: () => setAnonymousFeatureHovered(false),
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
      comments: 2,
      isAnonymous: false
    },
    {
      id: 2,
      avatar: null,
      user: 'Anonymous Student',
      time: '1h ago',
      title: 'React Router v6 issue',
      content: 'Getting an error with nested routes in React Router v6. Any idea what\'s wrong with my setup?',
      tags: ['React', 'Coding', 'Anonymous'],
      upvotes: 3,
      comments: 1,
      isAnonymous: true
    }
  ];

  // Benefits of Anonymous Posting
  const anonymousBenefits = [
    {
      icon: <IconShield size={rem(24)} stroke={1.5} />,
      title: 'Ask Without Judgment',
      description: 'Feel free to ask any question without fear of judgment. Perfect for clearing fundamental doubts.'
    },
    {
      icon: <IconEyeOff size={rem(24)} stroke={1.5} />,
      title: 'Total Privacy',
      description: 'Your identity remains completely hidden. Only you know which questions you\'ve asked.'
    },
    {
      icon: <IconBolt size={rem(24)} stroke={1.5} />,
      title: 'Honest Responses',
      description: 'Receive candid answers when people don\'t know who\'s asking, leading to more authentic help.'
    }
  ];

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className={classes.landingWrapper} style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.8s ease-out' }}>
          {/* Hero Section */}
          <div className={classes.hero}>
            <Container size="xl">
              <div className={classes.heroContent}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Title className={classes.title}>Welcome to LNMDoubts</Title>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Text className={classes.subtitle}>
                    Anytime, Anywhere, Anonymous Doubt Solving by Your Fellow Students
                  </Text>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Text className={classes.description}>
                    LNMDoubts connects you with a community of students ready to help. Post your questions 
                    openly or <span className={classes.highlightText}>stay anonymous</span> – get answers 
                    from peers in a safe, judgment-free space built for LNMIIT students.
                  </Text>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <Group justify="center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        size="lg" 
                        className={classes.ctaButton}
                        onClick={open}
                        rightSection={<IconArrowRight size={18} />}
                      >
                        Ask a Doubt Now
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
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
                    </motion.div>
                  </Group>
                </motion.div>
              </div>
            </Container>
          </div>

          {/* How It Works Section */}
          <Container size="lg" className={classes.howItWorksSection}>
            <Title order={2} className={classes.sectionTitle} ta="center">
              <div className="flex-1 flex items-center">How It Works</div>
            </Title>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing={30}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
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
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={classes.stepCard}>
                  <ThemeIcon size={60} radius={60} className={classes.stepIcon}>
                    <Text size={24}>2</Text>
                  </ThemeIcon>
                  <Text className={classes.stepTitle}>
                    Post Your Doubt
                  </Text>
                  <Text size="sm" c="dimmed">
                    Share your question publicly or <span className={classes.anonymousHighlight}>anonymously</span> to get the best possible answers
                  </Text>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
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
              </motion.div>
            </SimpleGrid>
          </Container>

          {/* Anonymous Feature Spotlight */}
          <Container size="lg" py={80} className={classes.anonymousSpotlight}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card 
  radius="lg" 
  className={classes.spotlightCard} 
  shadow="md" 
  style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'rgba(123, 93, 249, 0.3)' }}
>

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing={30}>
                  <div className={classes.spotlightContent}>
                    <Badge 
                      size="lg" 
                      radius="sm" 
                      variant="filled" 
                      color="indigo" 
                      className={classes.featureBadge}
                      leftSection={<IconIncognito size={14} />}
                    >
                      NEW FEATURE
                    </Badge>
                    <Title order={2} mt="md" className={classes.spotlightTitle}>
                      Ask Doubts Anonymously
                    </Title>
                    <Text className={classes.spotlightDescription} mt="md">
                      Sometimes, the questions we need to ask most are the ones we're hesitant to ask publicly.
                      LNMDoubts now lets you choose whether to post with your identity or remain completely anonymous.
                    </Text>
                    
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={20} mt={30}>
                      {anonymousBenefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Card className={classes.benefitCard} radius="md" p="md">
                            <ThemeIcon size={44} radius={44} className={classes.benefitIcon}>
                              {benefit.icon}
                            </ThemeIcon>
                            <Text fw={600} mt="sm" size="sm">
                              {benefit.title}
                            </Text>
                            <Text size="xs" c="dimmed" mt={5}>
                              {benefit.description}
                            </Text>
                          </Card>
                        </motion.div>
                      ))}
                    </SimpleGrid>
                  </div>
                  
                  <div className={classes.anonymousDemoWrapper}>
                  <Paper 
  radius="md" 
  p="md" 
  className={classes.anonymousDemo} 
  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(123, 93, 249, 0.3)' }}
>
                      <Tabs value={activeDemoTab} onChange={setActiveDemoTab} radius="md" variant="pills" mb="md">
                        <Tabs.List grow>
                          <Tabs.Tab value="regular">Regular Post</Tabs.Tab>
                          <Tabs.Tab value="anonymous">Anonymous Post</Tabs.Tab>
                        </Tabs.List>
                      </Tabs>
                      
                      <Box className={classes.demoPost}>
                        <Group position="apart" mb="md">
                          <Group>
                            {activeDemoTab === 'regular' ? (
                              <Avatar radius="xl" color="blue">S</Avatar>
                            ) : (
                              <Avatar radius="xl" color="dark">
                                <IconIncognito size={20} />
                              </Avatar>
                            )}
                            <div>
                              <Text size="sm" fw={500}>
                                {activeDemoTab === 'regular' ? '23ucs456@lnmiit.ac.in' : 'Anonymous Student'}
                              </Text>
                              <Text size="xs" c="dimmed">Just now</Text>
                            </div>
                          </Group>
                        </Group>
                        
                        <TextInput
                          placeholder="What's your doubt about?"
                          defaultValue={activeDemoTab === 'regular' ? 
                            "Having trouble with linked list implementation" : 
                            "Struggling with recursion concepts"
                          }
                          mb="md"
                        />
                        
                        <Box 
  mb="md" 
  p="sm" 
  className={classes.demoEditor} 
  style={{ backgroundColor: 'rgba(30, 30, 40, 0.5)', border: '1px solid rgba(123, 93, 249, 0.2)' }}
>
                          <Text size="sm">
                            {activeDemoTab === 'regular' ? 
                              "Can someone help me with inserting a node in a doubly linked list? My code keeps seg faulting." : 
                              "I'm finding it difficult to understand recursion. Can someone explain with a simple example? I'm too embarrassed to ask in class."
                            }
                          </Text>
                        </Box>
                        
                        <Group position="apart">
                          <Group>
                            <Badge variant="filled" color="blue">DSA</Badge>
                            {activeDemoTab === 'anonymous' && (
                              <Badge variant="filled" color="gray">Anonymous</Badge>
                            )}
                          </Group>
                          
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Group>
                              <Switch 
                                checked={activeDemoTab === 'anonymous'}
                                onChange={() => setActiveDemoTab(activeDemoTab === 'regular' ? 'anonymous' : 'regular')}
                                color="dark"
                                size="md"
                                label={
                                  <Group>
                                    <IconIncognito size={16} />
                                    <Text size="sm">Post Anonymously</Text>
                                  </Group>
                                }
                              />
                            </Group>
                          </motion.div>
                        </Group>
                      </Box>
                    </Paper>
                  </div>
                </SimpleGrid>
              </Card>
            </motion.div>
          </Container>

          {/* Features Section */}
          <Container size="lg" className={classes.featuresSection}>
            <Title order={2} className={classes.sectionTitle} ta="center">
              Key Features
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={30}>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -10 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card 
                    key={index} 
                    className={`${classes.featureCard} ${feature.highlighted ? classes.highlightedFeature : ''}`} 
                    p="lg" 
                    radius="md" 
                    withBorder
                    onMouseEnter={feature.onMouseEnter}
                    onMouseLeave={feature.onMouseLeave}
                  >
                    <ThemeIcon 
                      size={50} 
                      radius={50} 
                      className={`${classes.featureIcon} ${feature.highlighted ? classes.highlightedIcon : ''}`}
                    >
                      {feature.icon}
                    </ThemeIcon>
                    <Text className={`${classes.featureTitle} ${feature.highlighted ? classes.highlightedTitle : ''}`}>
                      {feature.title}
                    </Text>
                    <Text size="sm" c="dimmed" className={classes.featureDescription}>
                      {feature.description}
                    </Text>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </Container>

          {/* Mock Feed Preview */}
          <Container size="lg" py={80}>
            <Title order={2} className={classes.sectionTitle} ta="center" mb={50}>
              See What Students Are Discussing
            </Title>
            <Paper 
  radius="md" 
  p={0} 
  style={{ 
    overflow: 'hidden', 
    border: '1px solid rgba(123, 93, 249, 0.3)',
    backgroundColor: 'var(--bg-dark)' 
  }}
>
<Box 
  p="md" 
  style={{ 
    borderBottom: '1px solid rgba(123, 93, 249, 0.3)', 
    background: 'var(--bg-card)',
    color: 'var(--text-color)'
  }}
>
                <Group position="apart">
                  <Group>
                    <IconMessageDots size={20} style={{ color: 'var(--primary)' }} />
                    <Text fw={600}>Doubt Feed</Text>
                  </Group>
                  <Group>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="subtle" compact leftIcon={<IconPlus size={18} />}>
                        New Post
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="subtle" compact leftIcon={<IconSearch size={18} />}>
                        Search
                      </Button>
                    </motion.div>
                  </Group>
                </Group>
              </Box>
              
              <ScrollArea h={400} p={0} style={{ background: 'var(--bg-dark)' }}>
                {mockPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0.8 }}
                    whileHover={{ 
                      opacity: 1,
                      backgroundColor: 'rgba(123, 93, 249, 0.08)',
                      transition: { duration: 0.2 }
                    }}
                  >
                   <Box 
  p="md" 
  mb="md" 
  style={{ 
    borderBottom: '1px solid rgba(123, 93, 249, 0.1)',
    color: 'var(--text-color)'
  }}
>
                      <Group position="apart" mb="xs">
                        <Group>
                          {post.isAnonymous ? (
                            <Avatar radius="xl" color="dark">
                              <IconIncognito size={20} />
                            </Avatar>
                          ) : (
                            <Avatar radius="xl" color="indigo">{post.avatar}</Avatar>
                          )}
                          <div>
                            <Group spacing={5}>
                              <Text size="sm" fw={500}>{post.user}</Text>
                              {post.isAnonymous && (
                                <Tooltip label="Posted anonymously">
                                  <ThemeIcon size={16} radius="xl" variant="light" color="gray">
                                    <IconEyeOff size={10} />
                                  </ThemeIcon>
                                </Tooltip>
                              )}
                            </Group>
                            <Text size="xs" c="dimmed">{post.time}</Text>
                          </div>
                        </Group>
                      </Group>
                      
                      <Text fw={700} size="lg" mb="xs">{post.title}</Text>
                      <Text size="sm" mb="sm">{post.content}</Text>
                      
                      <Group position="apart">
                        <Group spacing="xs">
                          {post.tags.map((tag, i) => (
                            <Badge 
                              key={i} 
                              variant="filled" 
                              color={tag === 'Anonymous' ? 'gray' : 'indigo'}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </Group>
                        <Group>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Tooltip label="Upvote">
                              <Button variant="subtle" compact leftIcon={<IconThumbUp size={16} />}>
                                {post.upvotes}
                              </Button>
                            </Tooltip>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Tooltip label="Comments">
                              <Button variant="subtle" compact leftIcon={<IconMessage size={16} />}>
                                {post.comments}
                              </Button>
                            </Tooltip>
                          </motion.div>
                        </Group>
                      </Group>
                    </Box>
                  </motion.div>
                ))}
              </ScrollArea>
            </Paper>
          </Container>

          {/* Testimonials on Anonymous Feature
          <Container size="lg" py={60}>
            <Title order={2} className={classes.sectionTitle} ta="center" mb={30}>
              What Students Are Saying
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={20}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card p="xl" radius="md" className={classes.testimonialCard}>
                  <Avatar size="lg" radius="xl" color="grape" className={classes.testimonialAvatar}>M</Avatar>
                  <Text fw={600} mt="md">Maths Major</Text>
                  <Text size="sm" c="dimmed" fz="xs">2nd Year</Text>
                  <Text mt="md" fz="sm" className={classes.testimonialText}>
                    "The anonymous feature is a game-changer. I was always scared to ask 'simple' questions, but now I can get help without worrying about judgement."
                  </Text>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card p="xl" radius="md" className={classes.testimonialCard}>
                  <Avatar size="lg" radius="xl" color="blue" className={classes.testimonialAvatar}>C</Avatar>
                  <Text fw={600} mt="md">CS Student</Text>
                  <Text size="sm" c="dimmed" fz="xs">3rd Year</Text>
                  <Text mt="md" fz="sm" className={classes.testimonialText}>
                    "Being able to ask questions anonymously helped me clear up concepts I was embarrassed to ask about in class. Got amazing answers too!"
                  </Text>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card p="xl" radius="md" className={classes.testimonialCard}>
                  <Avatar size="lg" radius="xl" color="orange" className={classes.testimonialAvatar}>E</Avatar>
                  <Text fw={600} mt="md">ECE Student</Text>
                  <Text size="sm" c="dimmed" fz="xs">1st Year</Text>
                  <Text mt="md" fz="sm" className={classes.testimonialText}>
                    "As a freshman, I was intimidated to ask seniors for help. The anonymous mode lets me learn without revealing I'm a first-year student."
                  </Text>
                </Card>
              </motion.div>
            </SimpleGrid>
          </Container> */}

          {/* Footer CTA */}
          <div className={classes.footerCta}>
            <Container size="md" className={classes.ctaContainer}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Title order={2} className={classes.ctaTitle} ta="center">
                  Join the Movement Today
                </Title>
                <Text className={classes.ctaText} ta="center">
                  Be part of a thriving community of students helping each other succeed.
                  Ask questions <span className={classes.anonymousHighlight}>openly or anonymously</span> – 
                  it's free, it's easy, and it's the smartest way to study.
                </Text>
                <Group justify="center" spacing="md">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      className={classes.ctaButton}
                      onClick={open}
                      leftSection={<IconMessageCircle size={20} />}
                    >
                      Join LNMDoubts Now
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className={classes.secondaryButton}
                      leftSection={<IconBrandGoogle size={18} />}
                    >
                      Sign in with Google
                    </Button>
                  </motion.div>
                </Group>
              </motion.div>
            </Container>
          </div>

          {/* Sticky CTA for mobile */}
          <motion.div
            animate={{ y: [5, 0, 5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={classes.stickyCta}
          >
            <Button 
              className={classes.ctaButton}
              onClick={open}
              size="md"
              leftSection={<IconIncognito size={18} />}
            >
              Ask Anonymously - It's Free
            </Button>
          </motion.div>

          {/* Authentication Modal */}
          <Modal
            opened={opened}
            onClose={close}
            size="lg"
            radius="md"
            centered
            className={classes.authModal}
            overlayProps={{
              backgroundOpacity: 0.55,
              blur: 3,
            }}
          >
            <Container size="sm">
              <Title ta="center" className={classes.authTitle}>
                {activeTab === 'login' ? 'Welcome Back' : 'Join LNMDoubts'}
              </Title>
              <Text c="dimmed" size="sm" ta="center" mt="md" mb="xl">
                {activeTab === 'login' 
                  ? 'Sign in with your LNMIIT email to continue'
                  : 'Create an account using your LNMIIT email address'}
              </Text>

              <Tabs value={activeTab} onChange={setActiveTab} radius="md" className={classes.tabs}>
                <Tabs.List grow>
                  <Tabs.Tab value="login">
                    Login
                  </Tabs.Tab>
                  <Tabs.Tab value="register">
                    Register
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>

              <form onSubmit={handleSubmit}>
                <Stack mt="xl">
                  <TextInput
                    label="Email"
                    placeholder="your.lnmiit.email@lnmiit.ac.in"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    icon={<IconMail style={iconStyle} />}
                    radius="md"
                    error={formError.includes('email') ? formError : null}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    icon={<IconLock style={iconStyle} />}
                    radius="md"
                    error={formError.includes('Password') ? formError : null}
                  />

                  {activeTab === 'register' && (
                    <PasswordInput
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      icon={<IconLock style={iconStyle} />}
                      radius="md"
                      error={formError.includes('match') ? formError : null}
                    />
                  )}

                  {(formError || authError) && (
                    <Text c="red" size="sm" ta="center">
                      {formError || authError}
                    </Text>
                  )}

                  <Button 
                    type="submit" 
                    radius="md" 
                    size="md"
                    loading={loading}
                    className={classes.submitButton}
                    fullWidth
                  >
                    {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                  </Button>
                </Stack>
              </form>

              <Divider label="Or continue with" labelPosition="center" my="lg" />

              <Group grow mb="md" mt="md">
                <Button
                  radius="md"
                  leftIcon={<IconBrandGoogle size={16} />}
                  variant="default"
                  color="gray"
                >
                  Google
                </Button>
                <Button
                  radius="md"
                  leftIcon={<IconBrandGithub size={16} />}
                  variant="default"
                  color="gray"
                >
                  GitHub
                </Button>
              </Group>

              <Text c="dimmed" size="sm" ta="center" mt="sm">
                By continuing, you agree to our{' '}
                <Text component="a" href="#" td="underline" c="blue">
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text component="a" href="#" td="underline" c="blue">
                  Privacy Policy
                </Text>
              </Text>
            </Container>
          </Modal>
        </div>
      </motion.div>
    </AuroraBackground>
  );
}