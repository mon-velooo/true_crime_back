import express, { Request, Response } from "express";
import * as service from "../../services/crimes.service";
import { Crime } from "../../models/Crime";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const where: any = {};
    const select: (keyof Crime)[] = [
      "id",
      "latitude",
      "longitude",
      "start_date",
      "end_date",
    ];
    // const filters = req.query;

    // Filter
    // if (filters.fullname) {
    //   where.fullname = ILike(`%${filters.fullname}%`);
    // }
    // if (filters.roleId) {
    //   where.role = { id: filters.roleId };
    // }
    // if (filters.isConnected === "true" || filters.isConnected === "false") {
    //   where.isConnected = filters.isConnected.toUpperCase();
    // }

    // const sortableKey = [
    //   { paramsKey: "fullname", accessKey: "fullname" },
    //   { paramsKey: "isConnected", accessKey: "isConnected" },
    //   { paramsKey: "isArchived", accessKey: "isArchived" },
    //   { paramsKey: "role", accessKey: "role.label" },
    // ];

    // const { order } = extractSortsFromFilters(req, sortableKey);

    const crimes = await service.getCrimes(where, select);

    res.status(200).send({ crimes });
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

// router.get("/:id", async (req: Request, res: Response) => {
//   try {
//     const id = req.params.id;
//     const athlete = await service.getOneAthleteById(id);
//     res.status(200).send(athlete);
//   } catch (error) {
//     res.status(500).send({ error: "An error occurred" });
//   }
// });

export default router;
