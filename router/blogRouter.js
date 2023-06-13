const { Router } = require('express')
const { create_blog, view_blog, my_blogs, delete_blog, create_like, create_comment, reply_comment, delete_comment } = require('../controllers/blogControllers')
const router = Router()
const Category = require('../models').undefined.Category
const Blog = require('../models').undefined.Blog

// Category.create({ name: "dogs" }).then((res) => {
//     //console.log(res);
// }).catch((err) => {
//     //console.log(err);
// })


module.exports = (uploadBlogPic) => {
    //console.log(uploadBlogPic);
    router.get('/createBlog', async (req, res) => {
        const categories = await Category.findAll()
        res.render('createBlog', { "categories": categories });
    })
    router.post('/createBlog', uploadBlogPic.single('blog_image'), create_blog)
    router.get('/viewBlog/:id', view_blog)
    router.get('/myBlogs', my_blogs)
    router.get('/deleteBlog/:id', delete_blog)
    router.post('/createLike/:id', create_like)
    router.post('/createComment/:id', create_comment)
    router.post('/replyComment/:id', reply_comment)
    router.get('/deleteComment/:id', delete_comment)
    return router;
}