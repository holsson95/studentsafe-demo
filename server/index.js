require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pool = require('./db');
const path = require('path');
const caseRoute = require('./routes/caseRoute');
const schoolRoute = require('./routes/schoolRoute');
const studentRoute = require('./routes/studentRoute');
const authRoute = require('./routes/authRoute');
const { authenticate } = require('./middleware/authMiddleware');
const userRoute = require('./routes/userRoute');
const notificationsRoute = require('./routes/notificationsRoute');
const searchRoute = require('./routes/searchRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const dropdownRoute = require('./routes/dropdownRoute');
const inviteRoute = require('./routes/inviteRoute');
const logRoute = require('./routes/logRoute');
const caseReminderService = require('./services/caseReminderService');
const cron = require('node-cron');


const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], 
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,  // keep off — needed for some asset loading
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use('/cases', caseRoute);
app.use('/schools', schoolRoute);
app.use('/students',studentRoute);
app.use('/auth', authRoute);
app.use('/users', userRoute);
app.use('/notifications', notificationsRoute);
app.use('/search', searchRoute);
app.use('/dashboard', dashboardRoute);
app.use('/dropdown', dropdownRoute);
app.use('/users', inviteRoute);
app.use('/logs', logRoute);
app.use('/uploads', authenticate, express.static(path.join(__dirname, 'uploads')));

caseReminderService.runCaseReminders();
cron.schedule('0 9 * * *', async () => {
    console.log('[Reminder Service] Running scheduled case reminder check...');
    await caseReminderService.runCaseReminders();
},
{
    timezone: 'Asia/Bangkok'
});

app.get('/', authenticate, async (req, res) => {
    try{
        const result = await pool.query('SELECT NOW()');
        res.send(`Database Connected. Time: ${result.rows[0].now}`);
    }catch (error){
        console.error(error);
        res.status(500).send('Database connection failed');
    }
});

app.get('/protected', authenticate, (req, res) => {
    res.json({message: `Hello, ${req.user.email}`});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));