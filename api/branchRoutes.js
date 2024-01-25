const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const db = mongoose.connection;

// BRANCH ENDPOINTS

// GET all Branches
router.get("/api/branches", async (req, res) => {
    try {
        const branches = await db.collection("Branches").find({}).toArray();
        console.log(branches);
        res.json(branches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET Branch by Identification
router.get("/api/branches/:id", async (req, res) => {
    try {
        const branch = await db
            .collection("Branches")
            .findOne({ Identification: req.params.id });
        console.log(branch);
        res.json(branch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE a Branch by Identification
router.put("/api/branches/:id", async (req, res) => {
    try {
        const updatedBranch = await db
            .collection("Branches")
            .findOneAndUpdate(
                { Identification: req.params.id },
                { $set: req.body },
                { returnDocument: "after" }
            );
        console.log(updatedBranch);
        res.json(updatedBranch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a Branch by Identification
router.delete("/api/branches/:id", async (req, res) => {
    try {
        const deletedBranch = await db
            .collection("Branches")
            .deleteOne({ Identification: req.params.id });
        if (deletedBranch.deletedCount === 0) {
            return res.status(404).json({ message: "Branch not found" });
        }
        console.log(deletedBranch);
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new Branch
router.post("/api/branches", async (req, res) => {
    try {
        const newBranch = await db.collection("Branches").insertOne(req.body);
        console.log(newBranch);
        res.status(201).json(newBranch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;