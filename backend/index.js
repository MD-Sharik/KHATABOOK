const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
app.use(bodyParser.json());

dotenv.config();
// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

// CORS options
const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend URL
};

app.use(cors(corsOptions));

// JWT Authentication Setup
const getUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0]; // Return the user object if found
};

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRETORKEY, // Replace with your actual secret key
    },
    async (payload, done) => {
      try {
        const user = await getUserById(payload.sub); // Now this function is defined
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        console.error("Error in JWT authentication:", error);
        return done(error, false);
      }
    }
  )
);

app.use(passport.initialize());

// Test route to check the connection
app.get("/allusers", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * from users where email is not null and phone_number is not null"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Basic test route
app.get("/", async (req, res) => {
  try {
    res.status(200).send("Welcome!");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// User Signup
app.post("/signup", async (req, res) => {
  const { email, phone_number, name } = req.body; // Updated to use phone_number

  try {
    const result = await pool.query(
      "INSERT INTO users (email, phone_number, name) VALUES ($1, $2, $3) RETURNING *",
      [email, phone_number, name] // Updated to use phone_number
    );

    res.json(result.rows[0]); // Only respond with the created user info
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user", error });
  }
});

// Add a new book
app.post(
  "/booksCreate",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id; // Get the user ID from the JWT

    try {
      const result = await pool.query(
        "INSERT INTO books (user_id, name, description) VALUES ($1, $2, $3) RETURNING *",
        [userId, name, description]
      );
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create book", error });
    }
  }
);

// Endpoint to add a user to a book
app.post(
  "/books/:bookId/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { bookId } = req.params;
    const { name } = req.body; // Assuming you send the user's name

    try {
      const result = await pool.query(
        "INSERT INTO users (name) VALUES ($1) RETURNING *", // Assuming users table has a 'name' column
        [name]
      );
      const newUser = result.rows[0];

      // Now link the user to the book (this could also be a separate table)
      await pool.query(
        "INSERT INTO participants (book_id, user_id) VALUES ($1, $2)",
        [bookId, newUser.id]
      );

      res.status(201).json(newUser); // Respond with the created user
    } catch (error) {
      console.error("Error adding user to book:", error);
      res.status(500).json({ error: "Failed to add user" });
    }
  }
);

// Get all books for a user
app.get(
  "/books",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userId = req.user.id;

    try {
      const result = await pool.query(
        "SELECT * FROM books WHERE user_id = $1",
        [userId]
      );
      res.json(result.rows); // Respond with all books for the user
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch books", error });
    }
  }
);

// Fetch a specific book by its ID
// app.get(
//   "/books/:bookId",
//   passport.authenticate("jwt", { session: false }),
//   async (req, res) => {
//     const { bookId } = req.params;
//     const userId = req.user.id;

//     try {
//       // Fetch the book details
//       const bookResult = await pool.query(
//         "SELECT * FROM books WHERE id = $1 AND user_id = $2",
//         [bookId, userId]
//       );

//       // Fetch associated participants for the book
//       const usersResult = await pool.query(
//         "SELECT u.* FROM users u JOIN participants p ON u.id = p.user_id WHERE p.book_id = $1",
//         [bookId]
//       );

//       // Fetch associated transactions for the book
//       const transactionsResult = await pool.query(
//         "SELECT * FROM transactions WHERE book_id = $1",
//         [bookId]
//       );

//       if (bookResult.rows.length > 0) {
//         const book = bookResult.rows[0];
//         res.json({
//           book,
//           users: usersResult.rows,
//           transactions: transactionsResult.rows,
//         });
//       } else {
//         res.status(404).json({ error: "Book not found" });
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Failed to fetch book details" });
//     }
//   }
// );
app.get(
  "/books/:bookId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user.id;

    try {
      // Fetch the book details
      const bookResult = await pool.query(
        "SELECT * FROM books WHERE id = $1 AND user_id = $2",
        [bookId, userId]
      );

      // Fetch associated participants for the book
      const usersResult = await pool.query(
        `SELECT u.*, 
                COALESCE(SUM(CASE WHEN t.type = 'get' THEN t.amount ELSE -t.amount END), 0) as tally
         FROM users u
         JOIN participants p ON u.id = p.user_id
         LEFT JOIN transactions t ON (u.id = t.sender_id OR u.id = t.receiver_id) AND t.book_id = $1
         WHERE p.book_id = $1
         GROUP BY u.id`,
        [bookId]
      );

      // Fetch associated transactions for the book
      const transactionsResult = await pool.query(
        "SELECT * FROM transactions WHERE book_id = $1",
        [bookId]
      );

      if (bookResult.rows.length > 0) {
        const book = bookResult.rows[0];
        res.json({
          book,
          users: usersResult.rows,
          transactions: transactionsResult.rows,
        });
      } else {
        res.status(404).json({ error: "Book not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch book details" });
    }
  }
);

// Get accounting details for a specific user in a book
// app.get(
//   "/books/:bookId/users/:userId",
//   passport.authenticate("jwt", { session: false }),
//   async (req, res) => {
//     const { bookId, userId } = req.params;

//     try {
//       // Fetch the user details
//       const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
//         userId,
//       ]);

//       // Fetch the transactions related to the user and book
//       const transactionsResult = await pool.query(
//         `SELECT * FROM transactions
//          WHERE book_id = $1 AND (sender_id = $2 OR receiver_id = $2)`,
//         [bookId, userId]
//       );

//       if (userResult.rows.length > 0) {
//         const user = userResult.rows[0];
//         res.json({
//           user,
//           transactions: transactionsResult.rows,
//         });
//       } else {
//         res.status(404).json({ error: "User not found" });
//       }
//     } catch (error) {
//       console.error("Error fetching user accounting details:", error);
//       res
//         .status(500)
//         .json({ error: "Failed to fetch user accounting details" });
//     }
//   }
// );

// Get user accounting details for a specific book (user's transactions and tally)
app.get(
  "/books/:bookId/users/:userId/accounting",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { bookId, userId } = req.params;

    try {
      // Fetch all transactions related to this user and specific book
      const transactionsResult = await pool.query(
        `SELECT * FROM transactions
         WHERE book_id = $1 AND (sender_id = $2 OR receiver_id = $2)`,
        [bookId, userId]
      );

      // Calculate total tally for the user within this book
      const tallyResult = await pool.query(
        `SELECT SUM(CASE WHEN type = 'get' THEN amount ELSE -amount END) AS tally 
         FROM transactions 
         WHERE book_id = $1 AND (sender_id = $2 OR receiver_id = $2)`,
        [bookId, userId]
      );

      const tally = tallyResult.rows[0].tally || 0;

      // Return transactions and tally for the specific book
      res.status(200).json({
        transactions: transactionsResult.rows,
        tally,
      });
    } catch (error) {
      console.error("Error fetching user accounting details:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch user accounting details" });
    }
  }
);

// POST /users/:userId/accounting
app.post(
  "/users/:userId/accounting",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { userId } = req.params;
    const { amount, type, bookId, remarks } = req.body; // Expect bookId to be sent in the body

    // Input validation
    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ error: "Amount must be a valid number" });
    }
    if (type !== "give" && type !== "get") {
      return res
        .status(400)
        .json({ error: "Type must be either 'give' or 'get'" });
    }

    try {
      // Insert new transaction record
      const newTransaction = await pool.query(
        "INSERT INTO transactions (book_id, sender_id, receiver_id, amount, type,remarks) VALUES ($1, $2, $3, $4, $5,$6) RETURNING *",
        [bookId, req.user.id, userId, amount, type, remarks]
      );

      // Calculate total tally for the user
      const tallyResult = await pool.query(
        "SELECT SUM(CASE WHEN type = 'get' THEN amount ELSE -amount END) AS tally FROM transactions WHERE receiver_id = $1 OR sender_id = $1",
        [userId]
      );

      const tally = tallyResult.rows[0].tally || 0;

      res.status(200).json({ transaction: newTransaction.rows[0], tally });
    } catch (error) {
      console.error("Error processing accounting:", error);
      res.status(500).json({ error: "Failed to update accounting" });
    }
  }
);

// Fetch a specific book by its ID, including user tallies
// Fetch a specific book by its ID with user tallies
app.get(
  "/books/:bookId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user.id;

    try {
      // Fetch the book details
      const bookResult = await pool.query(
        "SELECT * FROM books WHERE id = $1 AND user_id = $2",
        [bookId, userId]
      );

      // Fetch associated participants for the book
      const usersResult = await pool.query(
        "SELECT u.* FROM users u JOIN participants p ON u.id = p.user_id WHERE p.book_id = $1",
        [bookId]
      );

      // Fetch the tally for each user in the book
      const usersWithTally = await Promise.all(
        usersResult.rows.map(async (user) => {
          const tallyResult = await pool.query(
            `SELECT SUM(CASE WHEN type = 'get' THEN amount ELSE -amount END) AS tally 
           FROM transactions 
           WHERE book_id = $1 AND (sender_id = $2 OR receiver_id = $2)`,
            [bookId, user.id]
          );
          const tally = tallyResult.rows[0].tally || 0;
          return { ...user, tally };
        })
      );

      if (bookResult.rows.length > 0) {
        const book = bookResult.rows[0];
        res.json({
          book,
          users: usersWithTally,
        });
      } else {
        res.status(404).json({ error: "Book not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch book details" });
    }
  }
);

// GET /accounting/tally/:userId
app.get(
  "/accounting/tally/:userId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { userId } = req.params;

    try {
      const tallyResult = await pool.query(
        "SELECT SUM(CASE WHEN type = 'get' THEN amount ELSE -amount END) AS tally FROM transactions WHERE receiver_id = $1 OR sender_id = $1",
        [userId]
      );

      const tally = tallyResult.rows[0].tally || 0;

      res.status(200).json({ userId, tally });
    } catch (error) {
      console.error("Error fetching tally:", error);
      res.status(500).json({ error: "Failed to fetch tally" });
    }
  }
);

// User Login
app.post("/login", async (req, res) => {
  const { email, phone_number } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND phone_number = $2",
      [email, phone_number]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Assume you have a way to verify the password
    // If password is valid, create a JWT token
    const token = jwt.sign({ sub: user.id }, "huma1n@789", { expiresIn: "1h" });

    res.json({ userId: user.id, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
