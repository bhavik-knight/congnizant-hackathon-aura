import { Link, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Box,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Home as HomeIcon,
    Dashboard as DashboardIcon,
    Notifications as NotificationsIcon,
    Analytics as AnalyticsIcon,
    Spa as EcoIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
    {
        text: 'Home',
        icon: <HomeIcon />,
        path: '/',
    },
    {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
    },
    {
        text: 'Notifications',
        icon: <NotificationsIcon />,
        path: '/notifications',
    },
    {
        text: 'Analytics',
        icon: <AnalyticsIcon />,
        path: '/analytics',
    },
];

const Sidebar = ({ open, onClose }) => {
    const theme = useTheme();
    const location = useLocation();

    const drawerContent = (
        <Box sx={{ width: drawerWidth }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <EcoIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Aura Platform
                </Typography>
            </Box>
            <Divider />

            <List sx={{ pt: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            selected={location.pathname === item.path}
                            onClick={onClose}
                            sx={{
                                mx: 1,
                                mb: 0.5,
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    backgroundColor: theme.palette.primary.main + '10',
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.main + '20',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: theme.palette.primary.main,
                                    },
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: location.pathname === item.path
                                        ? theme.palette.primary.main
                                        : 'text.secondary',
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: location.pathname === item.path ? 600 : 400,
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider sx={{ mt: 2 }} />

            <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Quick Stats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                            Active Users
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                            2,847
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                            Green Windows
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                            18/24 hrs
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                            CO₂ Saved Today
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                            1.2 tons
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={open}
                onClose={onClose}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: `1px solid ${theme.palette.divider}`,
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: `1px solid ${theme.palette.divider}`,
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </>
    );
};

export default Sidebar;
