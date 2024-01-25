const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const db = mongoose.connection;

// ATM ENDPOINTS

// GET all ATMs
router.get("/api/atms", async (req, res) => {
    try {
        const atms = await db.collection("ATMs").find({}).toArray();
        console.log(atms);
        res.json(atms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ATM by Identification
router.get("/api/atms/:id", async (req, res) => {
    try {
        const atm = await db
            .collection("ATMs")
            .findOne({ Identification: req.params.id });
        console.log(atm);
        res.json(atm);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE an ATM by Identification
router.put("/api/atms/:id", async (req, res) => {
    try {
        const updatedAtm = await db
            .collection("ATMs")
            .findOneAndUpdate(
                { Identification: req.params.id },
                { $set: req.body },
                { returnDocument: "after" }
            );
        console.log(updatedAtm);
        res.json(updatedAtm);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE an ATM by Identification
router.delete("/api/atms/:id", async (req, res) => {
    try {
        const deletedAtm = await db
            .collection("ATMs")
            .deleteOne({ Identification: req.params.id });
        if (deletedAtm.deletedCount === 0) {
            return res.status(404).json({ message: "ATM not found" });
        }
        console.log(deletedAtm);
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new ATM
router.post("/api/atms", async (req, res) => {
    try {
        const newAtm = await db.collection("ATMs").insertOne(req.body);
        console.log(newAtm);
        res.status(201).json(newAtm);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});