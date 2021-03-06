const faunadb = require("faunadb");
const faunaClient = new faunadb.Client({ secret: process.env.FAUNA_SECRET });
const q = faunadb.query;

function convertRefToId(book) {
  book.id = book.ref.id;
  delete book.ref;
  return book;
}

async function getBooks() {
  const { data } = await faunaClient.query(
    q.Map(
      q.Paginate(q.Documents(q.Collection("books"))),
      q.Lambda("ref", q.Get(q.Var("ref")))
    )
  );
  const books = data.map((book) => {
    book.id = book.ref.id;
    delete book.ref;
    return book;
  });
  return books;
}

async function getBookById(id) {
  const book = await faunaClient.query(q.Get(q.Ref(q.Collection("books"), id)));
  book.id = book.ref.id;
  delete book.ref;
  return book;
}

async function getBooksByUser(userId) {
  const { data } = await faunaClient.query(
    q.Map(
      q.Paginate(q.Match(q.Index("books_by_user"), userId)),
      q.Lambda("ref", q.Get(q.Var("ref")))
    )
  );
  const books = data.map((book) => {
    book.id = book.ref.id;
    delete book.ref;
    return book;
  });
  return books;
}

async function createBook(author, title, completed, dateCompleted, userId) {
  return await faunaClient.query(
    q.Create(q.Collection("books"), {
      data: { author, title, completed, dateCompleted, userId }
    })
  );
}

async function updateBook(id, author, title, completed, dateCompleted) {
  return await faunaClient.query(
    q.Update(q.Ref(q.Collection("books"), id), {
      data: { author, title, completed, dateCompleted }
    })
  );
}

async function deleteBook(id) {
  return await faunaClient.query(q.Delete(q.Ref(q.Collection("books"), id)));
}

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getBooksByUser
};
