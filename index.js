const express = require('express');
const app = express();
const cors = require('cors');
const port = 4000;
const user = require('./routes/userRoute');
const account = require('./routes/accountRoute');

app.use(cors());
app.use(express.json());
app.use('/user', user);
app.use('/account', account);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
