const {
    validationResult
} = require('express-validator');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add a product",
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('admin/edit-product', {
            pageTitle: "Add product",
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                imageUrl: imageUrl,
                description: description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
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
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error);
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
                hasError: false,
                product: product,
                errorMessage: null,
                validationErrors: []
            });
        }).catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    const updatedPrice = req.body.price;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('admin/edit-product', {
            pageTitle: "Edit product",
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                _id: productId,
                title: updatedTitle,
                price: updatedPrice,
                imageUrl: updatedImageUrl,
                description: updatedDescription
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/')
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            Product.imageUrl = updatedImageUrl;
            product.save()
                .then(result => {
                    console.log("Product Updated")
                    res.redirect('/admin/products');
                })
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error);
        })
};

exports.getProducts = (req, res, next) => {
    Product.find({
            userId: req.user._id
        })
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then(products => {
            console.log(products)
            res.render('admin/products', {
                products: products,
                pageTitle: "Admin Products",
                path: "/admin/products",
            })
        }).catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId
    Product.deleteOne({
            _id: productId,
            userId: req.user._id
        })
        .then(() => {
            console.log("Product Destroyed")
            res.redirect('/admin/products')
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500;
            return next(error);
        })
};