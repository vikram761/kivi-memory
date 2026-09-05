import express from 'express';
import cors from 'cors';
import memoryRoutes from './routes/memory.routes';
import dotenv from 'dotenv';
dotenv.config();

export const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/memory', memoryRoutes);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`🚀 Kivi Memory API running on PORT: ${PORT}`);
    });
}

export default app;
