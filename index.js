
const express =require('express')
const mongoose = require('mongoose'); 
const cors = require('cors');

const adminRoutes=require("./routes/adminRoutes")
const employeeRoutes=require("./routes/employeeRoutes")

require('dotenv').config();
const app = express();
const port = process.env.PORT;
const DB=process.env.DATABASE

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
    origin: 'http://localhost:3000'
}));

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB successfully');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.get('/', (req, res) => {
    res.send('Welcome to my server!');
});

app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
