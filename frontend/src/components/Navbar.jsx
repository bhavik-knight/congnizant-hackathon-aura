import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Spa as EcoIcon,
} from '@mui/icons-material';

const Navbar = ({ onMenuClick }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: theme.zIndex.drawer + 1,
                backgroundColor: 'white',
                color: 'text.primary',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
            }}
        >
            <Toolbar>
                {isMobile && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={onMenuClick}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <EcoIcon
                        sx={{
                            mr: 1,
                            color: theme.palette.secondary.main,
                            fontSize: 32,
                        }}
                    />
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            fontWeight: 700,
                            fontFamily: '"Poppins", sans-serif',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Aura
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            ml: 1,
                            color: 'text.secondary',
                            display: { xs: 'none', sm: 'block' }
                        }}
                    >
                        Energy Optimization Platform
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            mr: 2,
                            display: { xs: 'none', md: 'block' }
                        }}
                    >
                        NS Power Admin Portal
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
