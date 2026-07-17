"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routers
const auth_1 = __importDefault(require("./routes/auth"));
const camps_1 = __importDefault(require("./routes/camps"));
const eligibility_1 = __importDefault(require("./routes/eligibility"));
const donations_1 = __importDefault(require("./routes/donations"));
const buddy_1 = __importDefault(require("./routes/buddy"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const awareness_1 = __importDefault(require("./routes/awareness"));
const ai_1 = __importDefault(require("./routes/ai"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const users_1 = __importDefault(require("./routes/users"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // allow React dev frontend
    credentials: true,
}));
app.use(express_1.default.json());
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/camps', camps_1.default);
app.use('/api/eligibility', eligibility_1.default);
app.use('/api/donations', donations_1.default);
app.use('/api/blood-buddy', buddy_1.default);
app.use('/api/leaderboard', leaderboard_1.default);
app.use('/api/awareness', awareness_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/users', users_1.default);
// Root path test
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'RudhiraConnect Backend is healthy and running.' });
});
// Start Server
app.listen(PORT, () => {
    console.log(`[RudhiraConnect Server] running on http://localhost:${PORT}`);
});
