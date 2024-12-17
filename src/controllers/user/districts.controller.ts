import express, { Request, Response } from "express";
import * as service from "../../services/districts.service";
import { District } from "../../models/District";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const where: any = {};
    const select: (keyof District)[] = [
      "id",
      "name"
    ];

    const districts = await service.getDistrict(where, select);

    res.status(200).send({ districts });
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const district = await service.getDistrictById(id);

    if (!district) {
      res.status(404).send({ error: "District not found" });
      return;
    }

    res.status(200).send(district);
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

router.get("/top10CrimesCount", async (req: Request, res: Response) => {
  try {
    const districts = await service.getTop10DistrictsByCrimes();

    res.status(200).send({ districts });
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

export default router;
