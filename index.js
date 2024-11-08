import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import { configDB } from './configDB.js'
const PORT = 3000

let connection
try {
    connection = await mysql.createConnection(configDB)
} catch (error) {
    console.log(error);
}

const app = express()
app.use(express.json())
app.use(cors())

app.get('/todos', async (req, res) => {
    try {
        const sql = "SELECT * FROM todos ORDER BY timestamp"
        const [rows, fields] = await connection.execute(sql)
        res.send(rows)
    } catch (error) {
        console.log(error);
    }
})

app.post('/todos', async (req, res) => {
    const { task } = req.body
    if (!task) return res.json({ msg: "Hiányzó adat!" })
    try {
        const sql = "insert into todos (task) values (?)"
        const values = [task]
        const [rows, fields] = await connection.execute(sql, values)
        console.log(rows, fields);
        res.json({ msg: "Sikeres hozzáadás!" })
    } catch (error) {
        console.log(error);
    }
})

app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params
    try {
        const sql = "delete from todos where id=?"
        const values = [id]
        const [rows] = await connection.execute(sql, values)
        console.log(rows.affectedRows);
        res.json({ msg: `${rows.affectedRows == 0 ? "Nincs törlendő adat!" : "Sikeres törlés!"}` })
    } catch (error) {
        console.log(error);
    }
})

app.put('/todos/completed/:id', async (req, res) => {
    const { id } = req.params
    try {
        const sql = "update todos set completed = not completed where id=?"
        const values = [id]
        const [rows] = await connection.execute(sql, values)
        console.log(rows.affectedRows);
        res.json({ msg: `${rows.affectedRows == 0 ? "Nincs frissítendő adat!" : "Sikeres frissítés!"}` })
    } catch (error) {
        console.log(error);
    }
})

app.put('/todos/task/:id', async (req, res) => {
    const { id } = req.params
    const { task } = req.body

    try {
        const sql = "update todos set task = ? where id=?"
        const values = [task, id]
        const [rows] = await connection.execute(sql, values)
        console.log(rows.affectedRows);
        res.json({ msg: `${rows.affectedRows == 0 ? "Nincs frissítendő adat!" : "Sikeres modosítás!"}` })
    } catch (error) {
        console.log(error);
    }
})

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));