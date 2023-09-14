import express from 'express';

const router = express.Router();

router.get('/employee', (req, res) => {
    res.json({ message: 'Berhasil Menggunakan Router' });
});

export default router;
