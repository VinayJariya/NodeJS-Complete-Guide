const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add a product",
        path: '/admin/add-product',
        editing: false
    })
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product({
        title: title,
        description: description,
        price: price,
        imageUrl: imageUrl,
        userId: req.user
    })
    product
        .save()
        .then(result => {
            console.log("Created Product")
            res.redirect('/admin/products')
        }).catch(err => {
            console.log(err)
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: "Edit product",
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            });
        }).catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    const updatedPrice = req.body.price;
    Product.findById(productId)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            Product.imageUrl = updatedImageUrl;
            product.save();
        })
        .then(result => {
            console.log("Product Updated")
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err))
};

exports.getProducts = (req, res, next) => {
    Product.find()
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then(products => {
            console.log(products)
            res.render('admin/products', {
                products: products,
                pageTitle: "Admin Products",
                path: "/admin/products"
            })
        }).catch(err => {
            console.log(err)
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId
    Product.findByIdAndRemove(productId)
        .then(() => {
            console.log("Product Destroyed")
            res.redirect('/admin/products')
        })
        .catch(err => console.log(err))
};