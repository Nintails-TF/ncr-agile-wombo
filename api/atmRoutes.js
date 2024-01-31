const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const db = mongoose.connection;

// Error handling function
function handleError(res, error) {
  console.error(error);
  res.status(500).json({ error: error.message });
}

// ATM ENDPOINTS

// GET all ATMs
router.get("/api/atms", async (req, res) => {
  try {
    const atms = await db.collection("ATMs").find({}).toArray();
    console.log(atms);
    res.json(atms);
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/api/atms/filter", async (req, res) => {
  try {
    const atms = await db
      .collection("ATMs")
      .find({
        Accessibility: {
          $all: req.body.Accessibility
            ? req.body.Accessibility
            : ["AudioCashMachine", "WheelchairAccess"],
        },
        ATMServices: {
          $all: req.body.ATMServices,
        },
        ATMServices: {
          $all: req.body.ATMServices
            ? req.body.ATMServices
            : [
                "CashWithdrawal",
                "CashDeposits",
                "PINChange",
                "ChequeDeposits",
                "Balance",
              ],
        },
        Access24HoursIndicator: req.body.Access24HoursIndicator
          ? req.body.Access24HoursIndicator
          : {
              $in: [true, false],
            },
        $and: [
          {
            $expr: {
              $lt: [
                {
                  $toDouble:
                    "$Location.PostalAddress.GeoLocation.GeographicCoordinates.Latitude",
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
                    "$Location.PostalAddress.GeoLocation.GeographicCoordinates.Latitude",
                },
              ],
            },
          },
          {
            $expr: {
              $lt: [
                {
                  $toDouble:
                    "$Location.PostalAddress.GeoLocation.GeographicCoordinates.Longitude",
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
                    "$Location.PostalAddress.GeoLocation.GeographicCoordinates.Longitude",
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

// GET ATM by Identification
router.get("/api/atms/:id", async (req, res) => {
  try {
    const atm = await db
      .collection("ATMs")
      .findOne({ Identification: req.params.id });
    console.log(atm);
    res.json(atm);
  } catch (error) {
    handleError(res, error);
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
    handleError(res, error);
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
    handleError(res, error);
  }
});

// POST a new ATM
router.post("/api/atms", async (req, res) => {
  try {
    const newAtm = await db.collection("ATMs").insertOne(req.body);
    console.log(newAtm);
    res.status(201).json(newAtm);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
