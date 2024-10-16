// Import library yang diperlukan
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk mengurai data JSON
app.use(express.json());

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Skema dan model untuk pengguna
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Skema dan model untuk latihan
const ExerciseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const Exercise = mongoose.model('Exercise', ExerciseSchema);

// Rute untuk menambahkan pengguna
app.post('/api/users', (req, res) => {
    const newUser = new User({ username: req.body.username });
    newUser.save()
        .then(user => res.json(user))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Rute untuk mengambil semua pengguna
app.get('/api/users', (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Rute untuk menambahkan latihan
app.post('/api/users/:id/exercises', (req, res) => {
    const { description, duration, date } = req.body;
    const newExercise = new Exercise({
        userId: req.params.id,
        description,
        duration,
        date: date ? new Date(date) : new Date()
    });

    newExercise.save()
        .then(exercise => res.json(exercise))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Rute untuk mengambil latihan pengguna tertentu
app.get('/api/users/:id/exercises', (req, res) => {
    Exercise.find({ userId: req.params.id })
        .then(exercises => {
            User.findById(req.params.id)
                .then(user => {
                    res.json({
                        userId: user._id,
                        username: user.username,
                        count: exercises.length,
                        exercises: exercises.map(ex => ({
                            _id: ex._id,
                            userId: ex.userId,
                            description: ex.description,
                            duration: ex.duration,
                            date: ex.date.toDateString()
                        }))
                    });
                });
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

// Rute untuk menghapus latihan tertentu
app.delete('/api/exercises/:id', (req, res) => {
    Exercise.findByIdAndDelete(req.params.id)
        .then(() => res.json('Exercise deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Memulai server
app.listen(PORT, () => {
    console.log(`Your app is listening on port ${PORT}`);
});
