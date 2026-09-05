require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

const User = require("./models/User");
const Income = require("./models/Income");
const Expense = require("./models/Expense");
const { protect } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ============ AUTH ROUTES ============

app.post("/api/auth/signup", upload.single("profileImage"), async(req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res
                .status(400)
                .json({ message: "Please fill all required fields" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res
                .status(400)
                .json({ message: "User already exists with this email" });
        }

        let profileImage = "";
        if (req.file) {
            profileImage = `/uploads/${req.file.filename}`;
        }

        const user = await User.create({
            fullName,
            email,
            password,
            profileImage,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error during signup" });
    }
});

app.post("/api/auth/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profileImage: user.profileImage,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});

app.get("/api/auth/me", protect, async(req, res) => {
    try {
        res.json({
            _id: req.user._id,
            fullName: req.user.fullName,
            email: req.user.email,
            profileImage: req.user.profileImage,
        });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.put(
    "/api/auth/profile-image",
    protect,
    upload.single("profileImage"),
    async(req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No image file provided" });
            }

            const profileImage = `/uploads/${req.file.filename}`;
            const user = await User.findByIdAndUpdate(
                req.user._id, { profileImage }, { new: true }
            ).select("-password");

            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage,
            });
        } catch (error) {
            console.error("Profile image upload error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// ============ INCOME ROUTES ============

app.post("/api/income", protect, async(req, res) => {
    try {
        const { title, amount, category, description, date } = req.body;

        if (!title || !amount || !category) {
            return res
                .status(400)
                .json({ message: "Please fill title, amount and category" });
        }

        const income = await Income.create({
            user: req.user._id,
            title,
            amount: Number(amount),
            category,
            description: description || "",
            date: date ? new Date(date) : Date.now(),
        });

        res.status(201).json(income);
    } catch (error) {
        console.error("Add income error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/income", protect, async(req, res) => {
    try {
        const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });
        res.json(incomes);
    } catch (error) {
        console.error("Get income error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete("/api/income/:id", protect, async(req, res) => {
    try {
        const income = await Income.findById(req.params.id);
        if (!income) {
            return res.status(404).json({ message: "Income not found" });
        }

        if (income.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await Income.findByIdAndDelete(req.params.id);
        res.json({ message: "Income removed successfully" });
    } catch (error) {
        console.error("Delete income error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/income/download/excel", protect, async(req, res) => {
    try {
        const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });
        const data = incomes.map((inc) => ({
            Title: inc.title,
            Category: inc.category,
            Amount: inc.amount,
            Description: inc.description,
            Date: new Date(inc.date).toLocaleDateString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Incomes");

        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=income-details.xlsx"
        );
        res.send(buffer);
    } catch (error) {
        console.error("Download income excel error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ============ EXPENSE ROUTES ============

app.post("/api/expense", protect, async(req, res) => {
    try {
        const { title, amount, category, description, date } = req.body;

        if (!title || !amount || !category) {
            return res
                .status(400)
                .json({ message: "Please fill title, amount and category" });
        }

        const expense = await Expense.create({
            user: req.user._id,
            title,
            amount: Number(amount),
            category,
            description: description || "",
            date: date ? new Date(date) : Date.now(),
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error("Add expense error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/expense", protect, async(req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        console.error("Get expense error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete("/api/expense/:id", protect, async(req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "Expense removed successfully" });
    } catch (error) {
        console.error("Delete expense error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/expense/download/excel", protect, async(req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
        const data = expenses.map((exp) => ({
            Title: exp.title,
            Category: exp.category,
            Amount: exp.amount,
            Description: exp.description,
            Date: new Date(exp.date).toLocaleDateString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=expense-details.xlsx"
        );
        res.send(buffer);
    } catch (error) {
        console.error("Download expense excel error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ============ DASHBOARD ROUTES ============

app.get("/api/dashboard/summary", protect, async(req, res) => {
    try {
        const userId = req.user._id;

        const totalIncome = await Income.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const totalExpense = await Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const incomeCount = await Income.countDocuments({ user: userId });
        const expenseCount = await Expense.countDocuments({ user: userId });

        const income = totalIncome.length > 0 ? totalIncome[0].total : 0;
        const expense = totalExpense.length > 0 ? totalExpense[0].total : 0;
        const balance = income - expense;

        res.json({
            totalIncome: income,
            totalExpense: expense,
            balance,
            incomeCount,
            expenseCount,
        });
    } catch (error) {
        console.error("Dashboard summary error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/dashboard/recent-transactions", protect, async(req, res) => {
    try {
        const userId = req.user._id;

        const recentIncomes = await Income.find({ user: userId })
            .sort({ date: -1 })
            .limit(5);
        const recentExpenses = await Expense.find({ user: userId })
            .sort({ date: -1 })
            .limit(5);

        const allTransactions = [
            ...recentIncomes.map((i) => ({
                ...i._doc,
                type: "income",
            })),
            ...recentExpenses.map((e) => ({
                ...e._doc,
                type: "expense",
            })),
        ];

        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(allTransactions.slice(0, 8));
    } catch (error) {
        console.error("Recent transactions error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get(
    "/api/dashboard/expense-category-wise",
    protect,
    async(req, res) => {
        try {
            const userId = req.user._id;
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const categoryWise = await Expense.aggregate([{
                    $match: {
                        user: new mongoose.Types.ObjectId(userId),
                        date: { $gte: thirtyDaysAgo },
                    },
                },
                { $group: { _id: "$category", total: { $sum: "$amount" } } },
                { $sort: { total: -1 } },
            ]);

            res.json(
                categoryWise.map((item) => ({
                    category: item._id,
                    amount: item.total,
                }))
            );
        } catch (error) {
            console.error("Expense category wise error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

app.get(
    "/api/dashboard/last-30-days-expenses",
    protect,
    async(req, res) => {
        try {
            const userId = req.user._id;
            const now = new Date();
            const result = [];

            for (let i = 29; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                const dayExpenses = await Expense.aggregate([{
                        $match: {
                            user: new mongoose.Types.ObjectId(userId),
                            date: { $gte: startOfDay, $lte: endOfDay },
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$amount" } } },
                ]);

                result.push({
                    date: date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    }),
                    amount: dayExpenses.length > 0 ? dayExpenses[0].total : 0,
                });
            }

            res.json(result);
        } catch (error) {
            console.error("Last 30 days expenses error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

app.get("/api/dashboard/last-60-days-income", protect, async(req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const categoryWise = await Income.aggregate([{
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    date: { $gte: sixtyDaysAgo },
                },
            },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } },
        ]);

        res.json(
            categoryWise.map((item) => ({
                category: item._id,
                amount: item.total,
            }))
        );
    } catch (error) {
        console.error("Last 60 days income error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/dashboard/expense-details", protect, async(req, res) => {
    try {
        const userId = req.user._id;

        const details = await Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } },
            { $limit: 6 },
        ]);

        res.json(
            details.map((item) => ({
                category: item._id,
                amount: item.total,
            }))
        );
    } catch (error) {
        console.error("Expense details error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/dashboard/income-details", protect, async(req, res) => {
    try {
        const userId = req.user._id;

        const details = await Income.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } },
            { $limit: 6 },
        ]);

        res.json(
            details.map((item) => ({
                category: item._id,
                amount: item.total,
            }))
        );
    } catch (error) {
        console.error("Income details error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});