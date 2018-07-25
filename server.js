'use strict';

const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { BlogPosts } = require('./models');

const app = express();
app.use(express.json());

app.get('/posts', (req, res) => {
  BlogPosts
    .find()
    .then(posts => {
      res.json({ posts: posts.map(post => post.serialize()) });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    });
});

app.get('/posts/:id', (req, res) => {
  BlogPosts
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

// how do we check for nested fields like firstName and lastName? cause right now this is validating that author field is correct but doesn't validate firstname or lastname

// how often do you use macros when it comes to web development? would it be handy to create one for the general setup for express pages, or would it be better to continue learning how to do things by hand for now?



app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  const nestedFields = ['firstName', 'lastName'];

  console.log(req.body);

  for(let i=0; i<requiredFields.length; i++) {
    if(!(requiredFields[i] in req.body)) {
      const message = `Missing \`${requiredFields[i]}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }

    try {
      if(requiredFields[i] === 'author') {
        for(let k=0; k<nestedFields.length; k++) {
          if(!(nestedFields[k] in req.body.author)) {
            const message = `Missing \`${requiredFields[i]}\` in author field of the request body`;
            console.error(message);
            return res.status(400).send(message);
          }
        }
      }
    } catch(err) {
        return res.status(500).json({ message: 'Author value is incorrect'});
    }
  }

  BlogPosts
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    })
    .then(post => res.status(201).json(post.serialize()))
    .catch(err => { res.status(500).json({ message: 'Internal server error'}) });
});

// so the first if statement checks if the first two values are defined, then it checks if they're equal? Is there also a statement of some sort that checks that in JavaScript?

// what was the reason for using parenthesis here?

// for the return json message, would we have condensed that down to one line because of es6?

// was there a reason why there wasn't a console.error(err) in this catch statement for put?

app.put('/posts/:id', (req, res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${ req.params.id }) and request body id ` +
      `(${req.body.id}) must match`
    );
    return res.status(400).json({ message });
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content', 'author'];
  const nestedFields = ['firstName', 'lastName'];

  console.log(req.body);

  updateableFields.forEach(field => {
    if(field in req.body) {
      toUpdate[field] = req.body[field];
    }

    if(field === 'author') {
      if(typeof(req.body.author) !== "object") {
        return res.status(400).send({ message: 'Author value is incorrect'})
      } else {
        for(let k=0; k<nestedFields.length; k++) {
          if(!(nestedFields[k] in req.body.author)) {
            const message = `Missing \`${nestedFields[k]}\` in author field of the request body`;
            console.error(message);
            return res.status(400).send(message);
          }
        }
      }
    }
  });

  BlogPosts
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }) );
});

app.delete('/posts/:id', (req, res) => {
  BlogPosts
    .findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }) );
});

let server;

function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if(err) {
        return reject(err);
      }

      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if(err) {
          return reject(err);s
        }
        resolve();
      });
    });
  });
}

if(require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
