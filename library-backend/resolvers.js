const jwt = require('jsonwebtoken')
const { GraphQLError } = require('graphql')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let result = await Book.find({})

      if (args.genre) {
        const cursor = Book.collection.find({
          genres: args.genre
        }).toArray()
        result = await cursor
      }

      return result
    },
    allAuthors: async () => {
      const result = await Author.find({})
      return result
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    bookCount: () => 0,
  },
  Book: {
    author: async (root) => {
      return await Author.findOne({ _id: root.author })
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          }
        })
      }
      
      const bookExists = await Book.exists({ title: args.title })
      
      if (bookExists) {
        throw new GraphQLError(`Book must be unique: ${args.title}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
          },
        })
      }

      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({ name: args.author })
        await author.save()
      }

      const book = new Book({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres
      })
      
      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError(`Saving book failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.book,
            error
          }
        })
      }

      return book
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          }
        })
      }

      const author = await Author.findOne({ name: args.name })

      if (!author) {
        return null
      }

      author.born = args.setBornTo

      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError(`Saving author failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.author,
            error
          }
        })
      }

      return author
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre
      })

      return user.save()
        .catch(error => {
          throw new GraphQLError(`Creating the user failed: ${error.message}`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== 'test') {
        throw new GraphQLError('_resetDatabase is only available in test mode')
      }
      await Book.deleteMany({})
      await Author.deleteMany({})
      await User.deleteMany({})
      return true
    },
  },
}

module.exports = resolvers