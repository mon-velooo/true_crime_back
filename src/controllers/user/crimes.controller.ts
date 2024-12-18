import express, { Request, Response } from "express";
import * as service from "../../services/crimes.service";
import { Crime } from "../../models/Crime";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      longitude,
      lattitude,
      zoomLevel,
      lawCategory,
      startDate,
      rangeStartDate,
      rangeEndDate,
    } = req.query;

    const RADIUS_KM = 1;

    if (!longitude || !lattitude || !zoomLevel) {
      return res.status(400).send({
        error: "Params wanted not provided: longitude, lattitude, zoomLevel",
      });
    }

    const longitudeFloat = parseFloat(longitude as string);
    const lattitudeFloat = parseFloat(lattitude as string);
    const zoomLevelFloat = parseFloat(zoomLevel as string);

    // const radiusInMeters = RADIUS_KM * 1000;
    const radiusInMeters = 40075016;
    // Ajuster le rayon en fonction du niveau de zoom
    const adjustedRadius =
      radiusInMeters * (1 / Math.pow(2, zoomLevelFloat - 1));

    const filters = {
      lawCategory: lawCategory
        ? parseInt(lawCategory as string, 10)
        : undefined,
      startDate: startDate ? (startDate as string) : undefined,
      rangeStartDate: rangeStartDate ? (rangeStartDate as string) : undefined,
      rangeEndDate: rangeEndDate ? (rangeEndDate as string) : undefined,
      // Ajoutez d'autres filtres ici si nécessaire
    };

    const crimes = await service.getCrimes(
      longitudeFloat,
      lattitudeFloat,
      adjustedRadius,
      filters
    );

    // const sortableKey = [
    //   { paramsKey: "fullname", accessKey: "fullname" },
    //   { paramsKey: "isConnected", accessKey: "isConnected" },
    //   { paramsKey: "isArchived", accessKey: "isArchived" },
    //   { paramsKey: "role", accessKey: "role.label" },
    // ];

    // const { order } = extractSortsFromFilters(req, sortableKey);

    res.status(200).send({ total: crimes.length, crimes });
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const crime = await service.getCrimeById(id);

    if (!crime) {
      res.status(404).send({ error: "Crime not found" });
      return;
    }

    res.status(200).send(crime);
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

// router.get("/offenceStats", async (req: Request, res: Response) => {
//   try {
//     const criminalTypeStats = await service.getTypeStats();
//     res.status(200).send(criminalTypeStats);
//   } catch (error) {
//     res.status(500).send({ error: "An error occurred" });
//   }
// });

export default router;
