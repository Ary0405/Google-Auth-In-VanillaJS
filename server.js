const express = require('express');
const app = express();
const port = process.env.PORT || 1010;

app.set('view engine' , 'html');
app.engine('html' , require('ejs').renderFile);
app.get('/' , (req,res) => {
    res.render('index');
});

app.get('/login' , (req,res) => {
    res.render('login');
})
app.listen(port , () => {
    console.log(`sever running on port ${port}`);
})