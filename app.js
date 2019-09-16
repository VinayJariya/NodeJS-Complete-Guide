const express = require('express');

const app = express();

app.use((req, res, next) => {
    console.log("In another middleware")
    res.send('<p>Hii</p>')
});

app.listen(3000);