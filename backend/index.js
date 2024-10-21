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
const bcrypt = require("bcrypt");
app.use(bodyParser.json());

dotenv.config();
// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
  ssl: {
    rejectUnauthorized: false,
    sslmode: "require",
  },
});

// CORS options
const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend URL
};

app.use(cors(corsOptions));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user; // Attach user object to the request
    next();
  });
};

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

// User Signupconst bcrypt = require('bcrypt');

app.post("/signup", async (req, res) => {
  const { email, phone_number, name, password } = req.body;

  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const result = await pool.query(
      "INSERT INTO users (email, phone_number, name, password) VALUES ($1, $2, $3, $4) RETURNING id, email, phone_number, name",
      [email, phone_number, name, hashedPassword]
    );

    const newUser = result.rows[0];

    // Generate a JWT token
    const token = jwt.sign({ sub: newUser.id }, "huma1n@789", {});

    // Respond with the user info and token
    res.status(201).json({
      user: newUser,
      token: token,
    });
  } catch (error) {
    console.error(error);
    if (error.constraint === "users_email_key") {
      res.status(400).json({ error: "Email already exists" });
    } else if (error.constraint === "users_phone_number_key") {
      res.status(400).json({ error: "Phone number already exists" });
    } else {
      res.status(500).json({ error: "Failed to create user" });
    }
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

app.post("/books/:bookId/invite", async (req, res) => {
  const { bookId } = req.params;
  const { email } = req.body;
  const inviterId = req.user.id; // Assuming you're using JWT and have a user object attached to req

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if the user already exists
    const userResult = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    const user = userResult.rows[0];

    if (user) {
      // Check if the user is already a participant in the book
      const participantResult = await pool.query(
        `SELECT * FROM participants WHERE book_id = $1 AND user_id = $2`,
        [bookId, user.id]
      );
      if (participantResult.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "User is already a participant in this book" });
      }

      // Add the user as a participant directly
      await pool.query(
        `INSERT INTO participants (book_id, user_id) VALUES ($1, $2)`,
        [bookId, user.id]
      );
      return res.status(200).json({ message: "User added to the book", user });
    } else {
      // If the user doesn't exist, create an invitation
      const inviteResult = await pool.query(
        `INSERT INTO invitations (email, book_id, inviter_id, status, created_at) 
         VALUES ($1, $2, $3, 'pending', NOW()) RETURNING *`,
        [email, bookId, inviterId]
      );
      const invitation = inviteResult.rows[0];

      // Send an invitation email
      sendInvitationEmail(email, invitation);

      return res.status(200).json({ message: "Invitation sent", invitation });
    }
  } catch (error) {
    console.error("Error inviting user:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while sending the invitation" });
  }
});

// Add Dummy User Route
app.post(
  "/books/:bookId/dummy_users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { bookId } = req.params;
    const { name } = req.body;

    try {
      // Insert dummy user into the dummy_users table
      const result = await pool.query(
        "INSERT INTO dummy_users (name, book_id) VALUES ($1, $2) RETURNING *",
        [name, bookId]
      );

      const dummyUser = result.rows[0];

      // Add dummy user as a participant in the book
      await pool.query(
        "INSERT INTO participants (user_id, book_id) VALUES ($1, $2)",
        [dummyUser.id, bookId]
      );

      res.status(201).json(dummyUser);
    } catch (error) {
      console.error("Error adding dummy user:", error);
      res.status(500).json({ error: "Failed to add dummy user" });
    }
  }
);

app.post("/deleteBook", async (req, res) => {
  const { bookId } = req.body;

  try {
    // First delete from related tables
    await pool.query("DELETE FROM transactions WHERE book_id = $1", [bookId]);
    await pool.query("DELETE FROM participants WHERE book_id = $1", [bookId]);
    await pool.query("DELETE FROM invitations WHERE book_id = $1", [bookId]);
    await pool.query("DELETE FROM dummy_users WHERE book_id = $1", [bookId]);

    // Then delete the book itself
    await pool.query("DELETE FROM books WHERE id = $1", [bookId]);

    return res.status(200).json({ message: `Deleted Book` });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

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

// Fetch Specific Book of a specific user
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

      // Fetch associated participants for the book, including the dummy user
      // const usersResult = await pool.query(
      //   `SELECT
      //     CASE
      //       WHEN u.id IS NOT NULL THEN u.id
      //       ELSE d.id
      //     END as id,
      //     CASE
      //       WHEN u.id IS NOT NULL THEN u.name
      //       ELSE d.name
      //     END as username,
      //     CASE
      //       WHEN u.id IS NOT NULL THEN u.email
      //       ELSE concat('dummy-', d.id, '@example.com')
      //     END as email,
      //     COALESCE(SUM(CASE WHEN t.type = 'get' THEN t.amount ELSE -t.amount END), 0) as tally
      //   FROM
      //     (SELECT id, user_id FROM participants WHERE book_id = $1
      //      UNION
      //      SELECT id, id as user_id FROM dummy_users WHERE book_id = $1) p
      //   LEFT JOIN users u ON p.user_id = u.id
      //   LEFT JOIN dummy_users d ON p.id = d.id
      //   LEFT JOIN transactions t ON (p.user_id = t.sender_id OR p.user_id = t.receiver_id) AND t.book_id = $1
      //   GROUP BY
      //     CASE WHEN u.id IS NOT NULL THEN u.id ELSE d.id END,
      //     CASE WHEN u.id IS NOT NULL THEN u.name ELSE d.name END,
      //     CASE WHEN u.id IS NOT NULL THEN u.email ELSE concat('dummy-', d.id, '@example.com') END`,
      //   [bookId]
      // );

      const usersResult = await pool.query(
        `SELECT 
            CASE 
              WHEN u.id IS NOT NULL THEN u.id 
              ELSE d.id 
            END as id,
            CASE 
              WHEN u.id IS NOT NULL THEN u.name 
              ELSE d.name 
            END as username,
            CASE 
              WHEN u.id IS NOT NULL THEN u.email 
              ELSE concat('dummy-', d.id, '@example.com')
            END as email,
            COALESCE(SUM(CASE 
              WHEN t.type = 'get' THEN t.amount 
              ELSE -t.amount 
            END), 0) as tally
          FROM participants p
          LEFT JOIN users u ON p.user_id = u.id
          LEFT JOIN dummy_users d ON p.dummy_user_id = d.id
          LEFT JOIN transactions t 
            ON (p.user_id = t.sender_id OR p.user_id = t.receiver_id OR p.dummy_user_id = t.sender_id OR p.dummy_user_id = t.receiver_id) 
            AND t.book_id = $1
          WHERE p.book_id = $1
          GROUP BY 
            CASE WHEN u.id IS NOT NULL THEN u.id ELSE d.id END,
            CASE WHEN u.id IS NOT NULL THEN u.name ELSE d.name END,
            CASE WHEN u.id IS NOT NULL THEN u.email ELSE concat('dummy-', d.id, '@example.com') END`,
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

// Get user accounting details for a specific book (user's transactions and tally)
app.get(
  "/books/:bookId/users/:userId/accounting",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { bookId, userId } = req.params;
    console.log(`Book ID: ${bookId}, User ID: ${userId}`);

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
    const { amount, type, bookId, remarks } = req.body;

    // Input validation
    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ error: "Amount must be a valid number" });
    }
    if (type !== "give" && type !== "get") {
      return res
        .status(400)
        .json({ error: "Type must be either 'give' or 'get'" });
    }

    // Log request body for debugging
    console.log("Request Body:", req.body);

    try {
      const bookIdInt = parseInt(bookId, 10); // Ensure bookId is an integer
      // Check if bookIdInt is a valid integer
      if (isNaN(bookIdInt)) {
        return res.status(400).json({ error: "Invalid bookId" });
      }

      // Check if sender is a participant in the book
      const participantCheck = await pool.query(
        "SELECT * FROM participants WHERE user_id = $1 AND book_id = $2",
        [req.user.id, bookIdInt]
      );

      if (participantCheck.rowCount === 0) {
        return res
          .status(403)
          .json({ error: "User not a participant in this book" });
      }

      // Insert new transaction record
      const newTransaction = await pool.query(
        "INSERT INTO transactions (book_id, sender_id, receiver_id, amount, type, remarks) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [bookIdInt, req.user.id, userId, amount, type, remarks]
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
  const { email, password } = req.body;

  try {
    // Fetch the user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // If password is valid, create a JWT token
    const token = jwt.sign({ sub: user.id }, "huma1n@123");

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
