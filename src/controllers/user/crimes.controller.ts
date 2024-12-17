import express, { Request, Response } from "express";
import * as service from "../../services/crimes.service";
import { Crime } from "../../models/Crime";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const select: (keyof Crime)[] = [
      "id",
      "latitude",
      "longitude",
      "start_date",
      "end_date",
    ];
    const { longitude, lattitude, radius, lawCategory } = req.query;

    if (!longitude || !lattitude || !radius) {
      return res.status(400).send({
        error: "Params wanted not provided: longitude, lattitude, radius",
      });
    }

    const longitudeFloat = parseFloat(longitude as string);
    const lattitudeFloat = parseFloat(lattitude as string);
    const radiusFloat = parseFloat(radius as string);

    const radiusInMeters = radiusFloat * 1000;

    const filters = {
      lawCategory: lawCategory
        ? parseInt(lawCategory as string, 10)
        : undefined,
      // Ajoutez d'autres filtres ici si nécessaire
    };

    const crimes = await service.getCrimes(
      select,
      longitudeFloat,
      lattitudeFloat,
      radiusInMeters,
      filters
    );

    // const sortableKey = [
    //   { paramsKey: "fullname", accessKey: "fullname" },
    //   { paramsKey: "isConnected", accessKey: "isConnected" },
    //   { paramsKey: "isArchived", accessKey: "isArchived" },
    //   { paramsKey: "role", accessKey: "role.label" },
    // ];

    // const { order } = extractSortsFromFilters(req, sortableKey);

    res.status(200).send({ crimes });
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

// router.get("/typeStats", async (req: Request, res: Response) => {
//   try {
//     const criminalTypeStats = await service.getTypeStats();
//     res.status(200).send(criminalTypeStats);
//   } catch (error) {
//     res.status(500).send({ error: "An error occurred" });
//   }
// });

export default router;
