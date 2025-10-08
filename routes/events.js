import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";
import { upload } from "../config/multer.js";

const router = express.Router();

// Helper function to handle errors
const handleError = (res, error, message = "Internal server error") => {
  console.error(error);
  res.status(500).json({ error: message });
};

router.get("/events", async (req, res) => {
  try {
    const { id, type, limit = 5, page = 1 } = req.query;
    const db = getDb();

    if (id) {
      // Fetch by ID
      const event = await db
        .collection("events")
        .findOne({ _id: new ObjectId(id) });
      if (!event) return res.status(404).json({ error: "Event not found" });
      return res.json(event);
    }

    if (type === "latest") {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const events = await db
        .collection("events")
        .find()
        .sort({ schedule: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      return res.json(events);
    }

    return res.status(400).json({
      error: "Provide either ?id=<event_id> OR ?type=latest&limit=n&page=m",
    });
  } catch (error) {
    return res.status(400).json({ error: "Invalid request" });
  }
});

////////////////////////////////////////////// post events

router.post("/events", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      tagline,
      schedule,
      description,
      moderator,
      category,
      sub_category,
      rigor_rank,
    } = req.body;

    // Basic validation
    if (!name || !tagline || !schedule || !description) {
      return res
        .status(400)
        .json({ error: "Please fill all the required fields." });
    }

    const db = getDb();

    const eventData = {
      type: "event",
      uid: 18,
      name,
      tagline,
      schedule: new Date(schedule),
      description,
      moderator: moderator || "",
      category: category || "",
      sub_category: sub_category || "",
      rigor_rank: parseInt(rigor_rank) || 0,
      attendees: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Add image path if file was uploaded
    if (req.file) {
      eventData.files = {
        image: req.file.filename,
      };
    }

    const result = await db.collection("events").insertOne(eventData);

    res.status(201).json({
      id: result.insertedId,
      message: "Event created successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to create event");
  }
});

// ///////////////////////// put update events/////
router.put("/events/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const db = getDb();

    // Check if event exists
    const existingEvent = await db.collection("events").findOne({
      _id: new ObjectId(id),
    });

    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    const updateData = { ...req.body, updated_at: new Date() };

    // Handle schedule date conversion
    if (updateData.schedule) {
      updateData.schedule = new Date(updateData.schedule);
    }

   

    // Add image path if new file was uploaded
    if (req.file) {
      updateData.files = {
        image: req.file.filename,
      };
    }

    const result = await db
      .collection("events")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    res.json({
      message: `Event updated successfully`,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ObjectId")) {
      return res.status(400).json({ error: "Invalid event ID format" });
    }
    handleError(res, error, "Failed to update event");
  }
});

// 5. DELETE event by ID
router.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const db = getDb();
    const result = await db.collection("events").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({
      message: "Event deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ObjectId")) {
      return res.status(400).json({ error: "Invalid event ID format" });
    }
    handleError(res, error, "Failed to delete event");
  }
});

export default router;
