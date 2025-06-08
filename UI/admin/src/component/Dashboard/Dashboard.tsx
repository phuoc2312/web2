import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Avatar,
    useTheme,
} from "@mui/material";
import PeopleIcon from '@mui/icons-material/People';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useGetList } from "react-admin";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export const Dashboard = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const { total: totalUsers, isLoading: loadingUsers } = useGetList('users', { pagination: { page: 1, perPage: 1 } });
    const { total: totalProducts, isLoading: loadingProducts } = useGetList('products', { pagination: { page: 1, perPage: 1 } });
    const { total: totalCategories, isLoading: loadingCategories } = useGetList('categories', { pagination: { page: 1, perPage: 1 } });
    const { total: totalOrders, isLoading: loadingOrders } = useGetList('orders', { pagination: { page: 1, perPage: 1 } });

    // Màu động theo theme
    const stats = [
        {
            name: "Users",
            value: totalUsers ?? 0,
            icon: <PeopleIcon />,
            color: "#1976d2",
            bg: isDark ? "#23272f" : "#e3f2fd",
        },
        {
            name: "Sản phẩm",
            value: totalProducts ?? 0,
            icon: <Inventory2Icon />,
            color: "#8e24aa",
            bg: isDark ? "#313543" : "#f3e5f5",
        },
        {
            name: "Danh mục",
            value: totalCategories ?? 0,
            icon: <CategoryIcon />,
            color: "#388e3c",
            bg: isDark ? "#23272f" : "#e8f5e9",
        },
        {
            name: "Đơn hàng",
            value: totalOrders ?? 0,
            icon: <ListAltIcon />,
            color: "#fbc02d",
            bg: isDark ? "#313543" : "#fffde7",
        },
    ];

    const loading = loadingUsers || loadingProducts || loadingCategories || loadingOrders;

    return (
        <Box sx={{ flexGrow: 1, mt: 6 }}>
            <Grid container spacing={3} justifyContent="center">
                {stats.map((stat) => (
                    <Grid item key={stat.name}>
                        <Card sx={{
                            minWidth: 220,
                            background: stat.bg,
                            boxShadow: 3,
                            borderRadius: 3,
                        }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
                                        {stat.icon}
                                    </Avatar>
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: stat.color,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {stat.name}
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                color: isDark ? "#fff" : "#222",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {loading ? "..." : stat.value}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ mt: 6, width: "100%", height: 350 }}>
                <Card sx={{ background: isDark ? "#23272f" : "#f5f5f5", boxShadow: 2 }}>
                    <CardContent>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                                fontWeight: 600,
                                color: isDark ? "#fff" : "#222",
                            }}
                        >
                            Thống kê tổng quan
                        </Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={stats}>
                                <XAxis dataKey="name" stroke={isDark ? "#fff" : "#222"} />
                                <YAxis allowDecimals={false} stroke={isDark ? "#fff" : "#222"} />
                                <Tooltip
                                    contentStyle={{
                                        background: isDark ? "#23272f" : "#fff",
                                        border: "none",
                                        color: isDark ? "#fff" : "#222",
                                    }}
                                    labelStyle={{ color: isDark ? "#fff" : "#222" }}
                                    itemStyle={{ color: isDark ? "#fff" : "#222" }}
                                />
                                <Bar dataKey="value">
                                    {stats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};