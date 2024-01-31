const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const db = mongoose.connection;

// Error handling function
function handleError(res, error) {
  console.error(error);
  res.status(500).json({ error: error.message });
}

// BRANCH ENDPOINTS

// GET all Branches
router.get("/api/branches", async (req, res) => {
  try {
    const branches = await db.collection("Branches").find({}).toArray();
    console.log(branches);
    res.json(branches);
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/api/branches/filter", async (req, res) => {
  try {
    const atms = await db
      .collection("Branches")
      .find({
        Accessibility: {
          $all: req.body.Accessibility
            ? req.body.Accessibility
            : [
                "WheelchairAccess",
                "LowerLevelCounter",
                "LevelAccess",
                "InductionLoop",
                "AutomaticDoors",
              ],
        },
        ServiceAndFacility: {
          $all: req.body.ServiceAndFacility
            ? req.body.ServiceAndFacility
            : ["WiFi"],
        },
        $and: [
          {
            $expr: {
              $lt: [
                {
                  $toDouble:
                    "$PostalAddress.GeoLocation.GeographicCoordinates.Latitude",
                },
                req.body.Latitude + req.body.Radius / 111,
              ],
            },
          },
          {
            $expr: {
              $lt: [
                req.body.Latitude - req.body.Radius / 111,
                {
                  $toDouble:
                    "$PostalAddress.GeoLocation.GeographicCoordinates.Latitude",
                },
              ],
            },
          },
          {
            $expr: {
              $lt: [
                {
                  $toDouble:
                    "$PostalAddress.GeoLocation.GeographicCoordinates.Longitude",
                },
                req.body.Longitude + req.body.Radius / 111,
              ],
            },
          },
          {
            $expr: {
              $lt: [
                req.body.Longitude - req.body.Radius / 111,
                {
                  $toDouble:
                    "$PostalAddress.GeoLocation.GeographicCoordinates.Longitude",
                },
              ],
            },
          },
        ],
      })
      .toArray();
    res.json(atms);
  } catch (error) {
    handleError(res, error);
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
    handleError(res, error);
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
    handleError(res, error);
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
    handleError(res, error);
  }
});

// POST a new Branch
router.post("/api/branches", async (req, res) => {
  try {
    const newBranch = await db.collection("Branches").insertOne(req.body);
    console.log(newBranch);
    res.status(201).json(newBranch);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
