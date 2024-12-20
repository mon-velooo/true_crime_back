import express, { Request, Response } from "express";
import * as service from "../../services/reportings.service";
import { io } from "../../app"; // Importez io depuis app.ts

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const reportings = await service.getReportings();

    res.status(200).send(reportings);
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, description } = req.body;

    if (!latitude || !longitude || !description) {
      return res.status(404).json({
        error: "Missing body params: latitude, longitude, description needed",
      });
    }

    // Parse et valide latitude/longitude
    const latitudeFloat = parseFloat(req.body.latitude);
    const longitudeFloat = parseFloat(req.body.longitude);

    // Vérifie si les valeurs sont valides
    if (
      isNaN(latitudeFloat) ||
      isNaN(longitudeFloat) ||
      latitudeFloat < -90 ||
      latitudeFloat > 90 ||
      longitudeFloat < -180 ||
      longitudeFloat > 180
    ) {
      return res.status(400).json({
        error: "Invalid latitude/longitude",
      });
    }

    const reporting = await service.createReporting(
      latitudeFloat,
      longitudeFloat,
      description as string
    );

    if (!reporting) {
      throw new Error("Error while creating report");
    }

    // Émettez un événement WebSocket à tous les clients connectés
    io.emit("newReporting", reporting);

    res.status(200).send({ success: "Reporting created with success" });
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

export default router;
