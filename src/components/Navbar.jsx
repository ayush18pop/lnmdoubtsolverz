import { useState, useEffect } from 'react';
import {
  IconBrandFeedly,
  IconUpload,
  IconBook,
  IconUser,
  IconLogout,
  IconMenu2,
  IconX,
  IconBell,
  IconSearch,
  IconMoon,
  IconSun,
  Icon123 as IconLogo,
} from '@tabler/icons-react';
import { 
  Text, 
  Group, 
  Burger, 
  Drawer, 
  ScrollArea, 
  UnstyledButton, 
  Stack,
  rem,
  useMantineColorScheme,
  ActionIcon,
  Menu,
  Avatar,
  Tooltip,
  Input,
  Divider,
  Button,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import classes from './Navbar.module.css';

const navItems = [
  { link: '/feed', label: 'Doubt Feed', icon: IconBrandFeedly },
  { link: '/postdoubt', label: 'Post Your Doubt', icon: IconUpload },
  { link: '/resources', label: 'Resources', icon: IconBook, soon: true },
  { link: '/profile', label: 'Profile', icon: IconUser },
];

export default function Navbar() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Close drawer on route change
  useEffect(() => {
    close();
  }, [location.pathname]);

  // Handle logout
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return '?';
    return user.email.substring(0, 2).toUpperCase();
  };

  // Mobile navbar links
  const mobileNavItems = navItems.map((item) => (
    <Link
      to={item.link}
      key={item.label}
      className={classes.mobileNavLink}
      data-active={isActive(item.link) || undefined}
      onClick={close}
    >
      <item.icon className={classes.mobileNavIcon} stroke={1.5} />
      <span>{item.label}</span>
      {item.soon && <Badge size="xs" color="blue">New!</Badge>}
      {item.label === "Resources" && <Badge size="xs" color="blue">New!</Badge>}
    </Link>
  ));

  // Desktop navbar links
  const links = navItems.map((item) => (
    <Link
      className={classes.link}
      data-active={isActive(item.link) || undefined}
      to={item.link}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
      
      {item.label === "Resources" && <Badge size="xs" color="green">New!</Badge>}
    </Link>
  ));
  return (
    <>
      {/* Mobile navbar */}
      <header className={classes.mobileHeader}>
        <Group justify="space-between" h="100%" px="md">
          <Group>
            <Burger 
              opened={opened} 
              onClick={toggle} 
              size="sm" 
              color="var(--mantine-color-white)"
              className={classes.burger}
            />
            <Text 
              size="xl" 
              fw={700}
              
            >
              LNMDoubts
            </Text>
          </Group>
          
          <Group>
            {/* <ActionIcon 
              variant="subtle" 
              color="gray" 
              onClick={() => toggleColorScheme()}
              className={classes.actionIcon}
            >
              {dark ? <IconSun size="1.1rem" /> : <IconMoon size="1.1rem" />}
            </ActionIcon> */}
            
            <ActionIcon variant="subtle" color="gray" className={classes.actionIcon}>
              <IconSearch size="1.1rem" />
            </ActionIcon>
            
            <Tooltip label="Notifications" position="bottom" withArrow>
              <ActionIcon variant="subtle" color="gray" className={classes.actionIcon}>
                <IconBell size="1.1rem" />
              </ActionIcon>
            </Tooltip>
            
            <Menu
              width={200}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton
                  className={classes.user}
                >
                  <Avatar 
                    radius="xl" 
                    size={30} 
                    color="indigo"
                  >
                    {getUserInitials()}
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                  component={Link}
                  to="/profile"
                >
                  Profile
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </header>

      {/* Mobile drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        size="xs"
        padding="md"
        title={
          <Text 
            fw={700} 
            
          >
            LNMDoubts
          </Text>
        }
        className={classes.mobileDrawer}
        overlayProps={{ color: 'var(--bg-dark)', backgroundOpacity: 0.55, blur: 3 }}
      >
        <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
          <Divider my="sm" />
          
          {isAuthenticated ? (
            <>
              <Group p="md" mb="md">
                <Avatar radius="xl" size="md" color="indigo">{getUserInitials()}</Avatar>
                <div>
                  <Text fw={500} size="sm">{user?.email}</Text>
                  <Text c="dimmed" size="xs">LNMIIT Student</Text>
                </div>
              </Group>
              <Divider my="sm" />
              <Stack p="md" gap="xs">
                {mobileNavItems}
              </Stack>
              <Divider my="sm" />
              <Group p="md" grow>
                <Button
                  onClick={handleLogout}
                  leftSection={<IconLogout size="1rem" />}
                  variant="light"
                >
                  Logout
                </Button>
              </Group>
            </>
          ) : (
            <Group p="md" grow>
              <Button
                onClick={() => {
                  navigate('/login');
                  close();
                }}
                
              >
                Sign in
              </Button>
            </Group>
          )}
        </ScrollArea>
      </Drawer>

      {/* Desktop navbar */}
      <nav className={classes.navbar}>
        <div className={classes.navbarMain}>
          <Group className={classes.header} justify="space-between">
            <Text 
              size="xl" 
              fw={700}
              
            >
              LNMDoubts
            </Text>
            <Text 
              size="xs" 
              fw={500} 
              className={classes.version}
              px={6} 
              py={3} 
              radius="sm"
            >
              v1.5
            </Text>
          </Group>
          {links}
        </div>

        <div className={classes.footer}>
          <UnstyledButton className={classes.link} onClick={handleLogout}>
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Logout</span>
          </UnstyledButton>
        </div>
      </nav>
    </>
  );
}
