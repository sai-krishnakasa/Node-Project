const handleErrors = require('../utils/handleErrors')
const Blog = require('../models').undefined.Blog;
const Category = require('../models').undefined.Category;
const Like = require('../models').undefined.Like;
const Comment = require('../models').undefined.Comment;
const User = require('../models').undefined.User;


//console.log(Category);

module.exports.create_like = (async (req, res) => {
    try {
        console.log("create_like Called")
        const user = res.locals.user;
        const blogId = req.params.id;
        const blog = await Blog.findByPk(blogId);
        // Create the like instance
        const alreadyLiked = await Like.findOne({
            where:
                { userId: user.id, blogId: blogId }
        })
        console.log("alreadyLiked", alreadyLiked)
        if (alreadyLiked) {
            await alreadyLiked.destroy();
        }
        else {
            const like = await Like.create({
                blogId: blogId, userId: user.id
            });
        }
        res.end()

    }
    catch (error) {
        console.error('Error creating like instance:', error);
    }

})

module.exports.create_blog = (async (req, res) => {
    const user = res.locals.user;
    // //console.log(req.body)
    const { category, title, description } = req.body;
    const isNumber = /^\d+$/.test(category);
    let getCategory = null;
    let blog = null;
    try {
        if (isNumber) {
            getCategory = await Category.findByPk(category);
        }
        else if (await Category.findOne(
            {
                where: {
                    name: category.toUpperCase()
                }
            }) != null) {

            console.log("Helllllllooooooo", (await Category.findOne(
                {
                    where: {
                        name: category.toUpperCase()
                    }
                })))
            getCategory = await Category.findOne(
                {
                    where: {
                        name: category.toUpperCase()
                    }
                })

        }
        else {
            getCategory = await Category.create({ name: category.toUpperCase() })
        }
        // //console.log(getCategory);
        // //console.log(req);
        if (req.file) {
            // //console.log(req.file);
            blog = await Blog.create({ title, description, blog_image: req.file.path.split('uploads\\')[1] })
            // //console.log(blog);
        }
        else {
            blog = await Blog.create({ title, description })
        }
        await getCategory.addBlog(blog);
        await user.addBlog(blog);
        res.status(200).json({ "success": "Blog Created Successfully" })
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ "errors": errors });
    }
})

module.exports.my_blogs = (async (req, res) => {
    const user = res.locals.user;
    try {
        const blogs = await Blog.findAll({
            where: {
                userId: user.id
            },
            include: [Category]
        });

        // res.status(200).json(blog);
        res.render('myBlogs', { "blogs": blogs });
    }
    catch (err) {
        console.log(err);
    }
});

module.exports.delete_blog = (async (req, res) => {
    const id = req.params.id;
    try {
        const blog = await Blog.findByPk(id);
        await blog.destroy();
        // res.status(200).json(blog);
        res.redirect('/myBlogs');
    }
    catch (err) {
        console.log(err);
    }
});

module.exports.create_comment = (async (req, res) => {
    const blogId = req.params.id;
    const user = res.locals.user;
    const { comment } = req.body;
    console.log(req.body);
    try {

        const newCommentContent = comment;
        const newComment = await Comment.create({
            content: newCommentContent,
            userId: user.id, // Associate with the user
            blogId: blogId, // Associate with the blog
        });
        res.status(201).json({ "success": "Comment Created Successfully" })
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ "errors": "Failed to Created Comment" })
    }

})

module.exports.reply_comment = (async (req, res) => {
    const parentCommentId = req.params.id; // ID of the parent comment
    const { comment } = req.body;

    console.log(req.body);
    try {
        const newComment = await Comment.create({
            content: comment,
            parentCommentId: parentCommentId,
            userId: res.locals.user.id
        });
        console.log('New comment created:', newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
    }
    res.end();
})

module.exports.delete_comment = (async (req, res) => {
    const commentId = req.params.id; // ID of the parent comment

    try {
        const comment = await Comment.findByPk(commentId);
        await comment.destroy();
        res.status(200).json({ "success": "Comment Deleted Successfully" });
    } catch (error) {
        res.status(400).json({ "error": "Error in deleting Comment" });
        console.error('Error Deleting comment:', error);
    }
})

module.exports.view_blog = (async (req, res) => {
    const id = req.params.id;
    const user = res.locals.user;
    console.log(id);
    try {
        if (isNaN(id)) {
            throw new Error('Invalid blog ID');
        }
        const blog = await Blog.findByPk(id, {
            include: [Category]
        });
        console.log(blog.description)
        if (!blog) {
            throw new Error('Blog not found');
        }
        // console.log(blog);
        // res.json({ "blog": blog })
        const like = await Like.findOne({
            where: { userId: user.id, blogId: blog.id },
        });
        let isLiked = false;
        if (like) {
            isLiked = true
        }

        const no_of_blogs = await Blog.findByPk(blog.id, {
            include: [Like],
        })

        const comments = await Comment.findAll({
            where: {
                blogId: blog.id
            },
            include: [
                { model: User }, // Include the associated User model
                {
                    model: Comment,
                    as: 'replies', // Use the alias 'replies' to represent the child comments
                    include: [{ model: User }] // Include the associated User model for child comments
                }
            ]
        });
        // console.log("Comments", comments)
        if (comments.replies && comments.replies.length > 0) {
            comments.replies.forEach(reply => {
                const replyId = reply.id;
                const replyContent = reply.content;
                const replyUser = reply.User;

                console.log('Reply:', replyContent);
                console.log('User:', replyUser);
            });
        }
        res.render('viewBlog', { "blog": blog, isLiked: isLiked, no_of_likes: no_of_blogs.Likes.length, comments: comments });
    }
    catch (err) {
        console.log(err);
    }
});
