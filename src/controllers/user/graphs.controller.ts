import { Request, Response, Router } from "express";
import {
  CrimeTypeStats,
  NumberCrimesByHourStats,
} from "../../types/stats/CrimeTypeStat";

import * as crimeService from "../../services/crimes.service";
import * as districService from "../../services/districts.service";

const router = Router();

router.get("/offencesCrimesCount", async (req: Request, res: Response) => {
  try {
    const { rangeStartDate, rangeEndDate } = req.query;

    // Valider que les deux dates sont fournies
    if (!rangeStartDate || !rangeEndDate) {
      return res
        .status(400)
        .json({ error: "rangeStartDate and rangeEndDate are required" });
    }

    const offencesStats = await crimeService.getCrimeCountByOffence(
      rangeStartDate as string,
      rangeEndDate as string
    );

    const totalCrime = await crimeService.getTotalCrimeByRangeDate(
      rangeStartDate as string,
      rangeEndDate as string
    );

    // get number of crimes total
    const totalCrimesOther =
      totalCrime -
      offencesStats.reduce((acc, current) => acc + current.crimeCount, 0);

    offencesStats.push({
      offence: { id: -1, code: "OTHER", description: "Other" },
      crimeCount: totalCrimesOther,
    });

    // Construire la réponse finale
    const response: CrimeTypeStats = {
      totalCrime,
      offencesStats,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching crimes stats:", error);
    res.status(500).send({ error: "An error occurred" });
  }
});

router.get("/topCrimesCountByDistrict", async (req: Request, res: Response) => {
  try {
    const { rangeStartDate, rangeEndDate } = req.query;

    // Valider que les deux dates sont fournies
    if (!rangeStartDate || !rangeEndDate) {
      return res
        .status(400)
        .json({ error: "rangeStartDate and rangeEndDate are required" });
    }

    const numberCrimesByDistrict =
      await districService.getTop10DistrictsByCrimes(
        rangeStartDate as string,
        rangeEndDate as string
      );

    res.status(200).send(numberCrimesByDistrict);
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

router.get("/crimesGroupByHourCount", async (req: Request, res: Response) => {
  try {
    const { rangeStartDate, rangeEndDate } = req.query;

    // Valider que les deux dates sont fournies
    if (!rangeStartDate || !rangeEndDate) {
      return res
        .status(400)
        .json({ error: "rangeStartDate and rangeEndDate are required" });
    }

    const numberCrimesGroupByHour = await crimeService.getCrimeCountGroupByHour(
      rangeStartDate as string,
      rangeEndDate as string
    );

    // Calculer la moyenne
    const totalCrimes = numberCrimesGroupByHour.reduce(
      (acc, current) => acc + current.crimeCount,
      0
    );

    const NUMBER_OF_HOURS = 24;

    // arrondi à la dizaine la plus proche
    const average = Math.floor(totalCrimes * (1 / NUMBER_OF_HOURS));

    // Construire la réponse finale
    const response: NumberCrimesByHourStats = {
      stats: numberCrimesGroupByHour,
      average,
    };

    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

export default router;
