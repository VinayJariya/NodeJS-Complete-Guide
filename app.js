const path = require('path')

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error')
const User = require('./models/user')


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById("5d839915d501e756c58bf811")
        .then(user => {
            req.user = new User(user._id, user.name, user.email, user.cart);
            next();
        })
        .catch(err => {
            console.log(err)
        }); 
})

app.use('/admin', adminRoutes.routes);
app.use(shopRoutes);

app.use(errorController.get404)

mongoose.connect('mongodb+srv://vjariya:Vinay7mongodb@cluster0-ypylx.mongodb.net/shop?retryWrites=true&w=majority')
.then(result => {
    app.listen(3000)
})
.catch(err => {
    console.log(err)
})