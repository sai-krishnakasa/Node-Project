const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
if (cluster.isMaster) {
    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        // Fork a new worker if a worker dies
        cluster.fork();
    });
} else {

    const express = require('express');
    const db = require('./models');
    const path = require('path');
    const ejs = require('ejs');
    const authRoutes = require('./router/authRouters');
    const userRoutes = require('./router/userRouter');
    const blogRoutes = require('./router/blogRouter');
    const multer = require('multer');
    const requireAuth = require('./middlewares/authMiddleware');
    const cookieParser = require('cookie-parser');
    const session = require('express-session');
    const { Op } = require('sequelize');
    const Category = require('./models').undefined.Category;
    const Blog = require('./models').undefined.Blog;


    (function () {
        const numWorkers = require('os').cpus().length;
        console.log(numWorkers);
    })()


    console.log(Category)


    const app = express();

    app.use(express.json());
    app.use(cookieParser());
    app.use(express.static('public'));
    app.use(express.static('uploads'));
    app.use('/uploads', express.static('uploads'));
    app.use('/viewBlog/blog_images', express.static('uploads/blog_images'));
    app.use('/blog_images', express.static('uploads/blog_images'));
    app.use('/profile_pics', express.static('uploads/profile_pics'));

    app.set('view engine', 'ejs');
    app.use(
        session({
            secret: 'secret salt',
            resave: false,
            saveUninitialized: true,
        })
    );
    app.listen(8000, async () => {
        //console.log('Server Started...');
        await db.sequelize.sync({});
        //console.log('All models were synchronized successfully.');
    });
    const profileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/profile_pics');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
        },
    });

    const blogStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/blog_images');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
        },
    });
    const uploadProfilePic = multer({ storage: profileStorage });
    const uploadBlogPic = multer({ storage: blogStorage });


    app.get('/', requireAuth, async (req, res) => {
        console.log(req.url)
        const searchQuery = req.url.substring(9,)
        if (searchQuery !== "" && req.url != '/') {
            const blogs = await Blog.findAll({
                where: {
                    [Op.or]: [
                        { description: { [Op.iLike]: `%${searchQuery}%` } },
                        { title: { [Op.iLike]: `%${searchQuery}%` } },
                        { '$Category.name$': { [Op.iLike]: `%${searchQuery}%` } }
                    ]
                },
                include: [Category],
                order: [['createdAt', 'DESC']],
            });
            console.log("searchQuery!=''")
            console.log("blogs", blogs)
            console.log("blogs", blogs.length)
            res.status(200).json({ "blogs": blogs })

        }
        else if (req.url != '/') {
            console.log("This should execute")
            const user = res.locals.user;
            //console.log((await user.getBlogs()))
            const blogs = await Blog.findAll({
                order: [['createdAt', 'DESC']],
                include: [Category],
            })
            res.status(200).json({ "blogs": blogs })

        }
        else {
            const user = res.locals.user;
            //console.log((await user.getBlogs()))
            const blogs = await Blog.findAll({
                order: [['createdAt', 'DESC']],
                include: [Category],
            })
            res.render('home.ejs', { "blogs": blogs, isHome: true });
        }
        //console.log("Single Blog")
        //console.log((await user.getBlogs()))
        // res.status(200).json({ "blogs": blogs })

    });

    app.use(authRoutes);
    //console.log(uploadBlogPic)
    app.use('/', requireAuth, userRoutes(uploadProfilePic));
    app.use('/', requireAuth, blogRoutes(uploadBlogPic));

    module.exports = { uploadProfilePic, uploadBlogPic };
}