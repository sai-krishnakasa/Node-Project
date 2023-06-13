const { Sequelize, DataTypes, sequelize } = require('sequelize');
const bcrypt = require('bcrypt')

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: {
                    args: [3, 50],
                    msg: "UserName Should be between 3-40 characters long!!"
                }
            }
        },
        profile_pic: {
            type: DataTypes.STRING,
            validate: {
                isFilePath(value) {
                    if (!/^[a-zA-Z0-9\/\\_.-]+$/.test(value)) {
                        throw new Error('Invalid file path');
                    }
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            unique: {
                msg: "Email is Already Registered!"
            },
            validate: {
                isEmail: {
                    msg: "Please Enter a Valid Email"
                },
            },
        },
        mobile_no: {
            type: DataTypes.BIGINT,
            unique: true,
            isNumeric: true,
            validate: {
                len: {
                    args: [10, 10],
                    msg: "Invalid Mobile Number"
                }
            }
        },
        password: {
            type: DataTypes.STRING
        },
    }, {
        hooks: {
            beforeCreate: async (user) => {
                const salt = await bcrypt.genSalt();
                user.password = await bcrypt.hash(user.password, salt);
            }
        },

    });
    User.login = async function (email, password) {

        const user = await this.findOne({ where: { email } });
        if (!user) {
            throw new Error(JSON.stringify({ "email": "Invalid Email" }));
        }
        if (user && bcrypt.compareSync(password, user.password)) {
            return user;
        } else {
            throw new Error(JSON.stringify({ "password": "Invalid Password" }));
        }

    };
    const Blog = sequelize.define('Blog', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            // validate: {
            //     isAlphanumeric: true,
            // },
        },
        description: {
            type: DataTypes.TEXT(100000),
            allowNull: false,
            // validate: {
            //     isAlphanumeric: true,
            // },
        },
        blog_image: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isFilePath(value) {
                    if (!/^[a-zA-Z0-9\/\\_.-]+$/.test(value)) {
                        throw new Error('Invalid file path');
                    }
                }
            }
        }
    });
    const Category = sequelize.define('Category', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            // validate: {
            //     isAlphanumeric: true,
            // },
        },
    });
    const Like = sequelize.define('Like', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // ...additional fields if needed

    });

    const Comment = sequelize.define('Comment', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        parentCommentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        // ...additional fields if needed
    });

    Comment.hasMany(Comment, {
        foreignKey: 'parentCommentId',
        as: 'replies',
        onDelete: 'CASCADE',
    });
    Comment.belongsTo(Comment, {
        foreignKey: 'parentCommentId',
        as: 'parentComment',
    });

    User.hasMany(Comment, { foreignKey: 'userId' });
    Comment.belongsTo(User, { foreignKey: 'userId' });

    Blog.hasMany(Comment, { foreignKey: 'blogId' });
    Comment.belongsTo(Blog, { foreignKey: 'blogId' });

    // Define the associations
    User.hasMany(Blog, { foreignKey: 'userId' });
    Blog.belongsTo(User, { foreignKey: 'userId' });

    Category.hasMany(Blog, { foreignKey: 'categoryId' });
    Blog.belongsTo(Category, { foreignKey: 'categoryId' });

    User.belongsToMany(Blog, { through: Like, foreignKey: 'userId', otherKey: 'blogId' });
    Blog.belongsToMany(User, { through: Like, foreignKey: 'blogId', otherKey: 'userId' });

    User.hasMany(Comment, { foreignKey: 'userId' });
    Comment.belongsTo(User, { foreignKey: 'userId' });

    Blog.hasMany(Comment, { foreignKey: 'blogId' });
    Comment.belongsTo(Blog, { foreignKey: 'blogId' });

    Blog.hasMany(Like, { foreignKey: 'blogId' });
    Like.belongsTo(Blog, { foreignKey: 'blogId' });

    User.belongsToMany(Like, { through: 'UserLikes', foreignKey: 'userId', otherKey: 'likeId' });
    Like.belongsToMany(User, { through: 'UserLikes', foreignKey: 'likeId', otherKey: 'userId' });

    return { User, Blog, Category, Like, Comment };

};




