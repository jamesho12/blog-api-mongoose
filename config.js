exports.DATABASE_URL = 'mongodb://admin:password123@ds141641.mlab.com:41641/my-blog-api';

// exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/my-blog-api';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-my-blog-api';
exports.PORT = process.env.PORT || 8080;
