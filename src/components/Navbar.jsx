import { useState } from 'react';
import {
  Icon2fa,
  IconBellRinging,
  IconBrandFeedly,
  IconDatabaseImport,
  IconFingerprint,
  IconHome,
  IconKey,
  IconLogout,
  IconQuestionMark,
  IconReceipt2,
  IconSettings,
  IconUpload,
} from '@tabler/icons-react';
import { Code, Group, Text } from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './NavbarSimpleColored.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const data = [
  { link: '/', label: 'Home', icon: IconHome },
  { link: '/feed', label: 'Doubt Feed', icon: IconBrandFeedly },
  { link: '/postdoubt', label: 'Post Your Doubt', icon: IconUpload },
  { link: '', label: 'SSH Keys', icon: IconKey },
  { link: '', label: 'Databases', icon: IconDatabaseImport },
  { link: '', label: 'Authentication', icon: Icon2fa },
  { link: '', label: 'Other Settings', icon: IconSettings },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [active, setActive] = useState(() => {
    const path = location.pathname;
    const activeItem = data.find(item => item.link === path);
    return activeItem ? activeItem.label : 'Home';
  });

  const handleLogout = async (event) => {
    event.preventDefault();
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // If not authenticated, don't render the navbar
  if (!isAuthenticated) {
    
    return null;
  }

  const handleNavigation = (event, item) => {
    event.preventDefault();
    setActive(item.label);
    navigate(item.link);
  };

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => handleNavigation(event, item)}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <MantineLogo size={28} inverted style={{ color: 'white' }} />
          <Code fw={700} className={classes.version}>
            v3.1.2
          </Code>
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        {user && (
          <Text size="sm" c="white" mb="md">
            Signed in as: {user.email}
          </Text>
        )}
        <a href="#" className={classes.link} onClick={handleLogout}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}