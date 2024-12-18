import { Request, Response, Router } from "express";
import { AppDataSource } from "../../database/data-source";
import { Crime } from "../../models/Crime";
import { Offence } from "../../models/Offence";
import { CrimeTypeStats } from "../../types/stats/CrimeTypeStat";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    // Obtenir la date actuelle sous forme de chaîne (YYYY-MM-DD)
    /* const currentDate = new Date().toISOString().split("T")[0]; */
    const currentDate = "2024-09-30"

    console.log(currentDate)

    // Récupérer tous les crimes de la date actuelle
    const crimeRepository = AppDataSource.getRepository(Crime);
    const crimesToday = await crimeRepository.find({
      where: {
        start_date: currentDate,
      },
      relations: ["offence"], // Inclure les données associées aux infractions
    });

    // Calculer le total des crimes
    const totalCrime = crimesToday.length;

    // Calculer les statistiques par type d'infraction
    const offencesStats = crimesToday.reduce((acc, crime) => {
      const offenceId = crime.offence.id;

      if (!acc[offenceId]) {
        acc[offenceId] = {
          offence: crime.offence,
          totalCrimeType: 0,
        };
      }

      acc[offenceId].totalCrimeType += 1;
      return acc;
    }, {} as Record<number, { offence: Offence; totalCrimeType: number }>);

    // Construire la réponse finale
    const response: CrimeTypeStats = {
      totalCrime,
      offencesStats: Object.values(offencesStats),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching crimes stats:", error);
    res.status(500).send({ error: "An error occurred" });
  }
});

export default router;
