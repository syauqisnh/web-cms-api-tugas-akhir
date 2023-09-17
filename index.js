import express from 'express';

const app = express();

app.listen(9900, () => {
    console.log('Successfully running on port 9900');
})