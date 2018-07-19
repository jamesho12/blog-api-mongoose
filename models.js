const mongoose = require('mongoose');

const blogPostsSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    firstName: { type: String, required: true},
    lastName: { type: String, required: true}
  },
  created: { type: Date, default: Date.now}
});

// so this virutal and serialize is needed to put together firstName and lastName for author?

blogPostsSchema.virtual('authorString').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

// even without a virtual, we would still need to serialize correct?

blogPostsSchema.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorString,
    create: this.created
  };
}

const BlogPosts = mongoose.model('Blogposts', blogPostsSchema);

// what is the proper naming convention for collections? Camel case or lowercase?
// so in the example mongoose.model breaks it down from 'Restaurants' to 'restaurants', how would this work for 'BlogPosts'?
// will it be 'blogPosts' or 'blogposts'

module.exports = { BlogPosts };
