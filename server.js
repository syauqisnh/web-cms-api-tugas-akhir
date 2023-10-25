const express = require('express');
const route = require('./routes/route');
const cors = require('cors'); // Import middleware cors
const app = express();

app.use(express.json());

// Gunakan middleware cors dengan opsi yang sesuai
app.use(cors());

app.use(route);

app.listen(9900, () => {
    console.log('Sedang Berjalan di port 9900');
});
