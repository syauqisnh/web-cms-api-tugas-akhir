import express from 'express';
import router from './routes/index.js'; // Perhatikan ekstensinya

const app = express();
const port = 3000;

app.use(express.json());
app.use(router);


const employee = [
    {id: 1, name: 'Syauqi Nur Hibatullah', postition: 'Software Developer'},
    {id: 2, name: 'Ahmad Fajri', postition: 'Front End Developer'},
    {id: 3, name: 'Nazaruddin Nurcharis', postition: 'Back End Developer'},
]

// app.get('/employee', (req, res) => {
//     const data = employee

//     const result = {
//         status: '200 OK',
//         data: data
//     }

//     res.json(result)
// })

app.get('/employee/:id', (req, res) => {
    const { id } = req.params

    let karyawan

    for (let i = 0; i < employee.length; i++) {
        if (employee[i].id === Number(id)) {
            karyawan = employee[i]
        }
    }

    if (karyawan === undefined) {
        return res.status(404).json({status: 404, message: 'data not found'})
    }

    res.json({status: 200, data: karyawan})
})

app.post('/employee', (req, res) => {
    const {name, postition} = req.body

    const lastUserEmployeeId = employee[employee.length -1].id
    const newIdEmployee = lastUserEmployeeId + 1

    const newEmployeeData = {id: newIdEmployee, name: name, postition: postition}
    employee.push(newEmployeeData)

    res.json({id: newIdEmployee, data: newEmployeeData})
})

app.listen(port, () => {
    console.log('Successfully running on port 3000');
})