import { Request, Response, Router } from "express";
import { AppDataSource } from "../../database/data-source";
import { Crime } from "../../models/Crime";
import { Offence } from "../../models/Offence";
import { District } from "../../models/District";
import { CrimeTypeStats } from "../../types/stats/CrimeTypeStat";
import { Between } from "typeorm";


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


router.get("/getByRange", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
  
      // Valider que les deux dates sont fournies
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "startDate and endDate are required" });
      }
  
      // Convertir les paramètres en Date (optionnel si les dates sont déjà valides)
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
  
      // Vérifier la validité des dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
  
      // Récupérer les crimes entre les deux dates
      const crimeRepository = AppDataSource.getRepository(Crime);
      const crimesInRange = await crimeRepository.find({
        where: {
          start_date: Between(start.toISOString().split("T")[0], end.toISOString().split("T")[0]),
        },
        relations: ["offence"], // Inclure les relations avec les infractions
      });
  
      // Calculer le total des crimes
      const totalCrime = crimesInRange.length;
  
      // Calculer les statistiques par type d'infraction
      const offencesStats = crimesInRange.reduce((acc, crime) => {
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

router.get("/by-district", async (req: Request, res: Response) => {
    try {
      // Obtenir les districts avec leurs crimes
      const districtRepository = AppDataSource.getRepository(District);
      const districts = await districtRepository.find({
        relations: ["crimes"], // Inclure les relations avec les crimes
      });
  
      // Calculer le nombre de crimes par district
      const crimesByDistrict = districts.map((district) => ({
        district: {
          id: district.id,
          name: district.name,
        },
        totalCrimes: district.crimes.length,
      }));
  
      // Répondre avec les données
      res.status(200).json(crimesByDistrict);
    } catch (error) {
      console.error("Error fetching crimes by district:", error);
      res.status(500).send({ error: "An error occurred" });
    }
});



router.get("/by-district-range", async (req: Request, res: Response) => {
    try {
      // Récupérer les dates de la plage de la requête (format : YYYY-MM-DD)
      let { startDate, endDate } = req.query;
  
      // Vérifier si les deux dates sont présentes et valides
      if (!startDate || !endDate || Array.isArray(startDate) || Array.isArray(endDate)) {
        return res.status(400).json({ error: "startDate and endDate are required and must be valid strings" });
      }
  
      // Convertir les dates de la requête en objets Date
      startDate = startDate as string; // Assurez-vous que c'est une chaîne
      endDate = endDate as string;     // Assurez-vous que c'est une chaîne
  
      const start = new Date(startDate); // Convertir en objet Date
      const end = new Date(endDate);     // Convertir en objet Date
  
      // Vérifier si les dates sont valides
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
  
      const districtRepository = AppDataSource.getRepository(District);
  
      // Obtenir les districts avec leurs crimes sur la plage de dates spécifiée
      const districts = await districtRepository.find({
        relations: ["crimes"],
      });
  
      // Calculer le nombre de crimes par district dans la plage de dates
      const crimesByDistrict = districts.map((district) => {
        // Filtrer les crimes par date dans la plage spécifiée
        const filteredCrimes = district.crimes.filter((crime) => {
          const crimeDate = new Date(crime.start_date); // Convertir la date du crime en Date
          return crimeDate >= start && crimeDate <= end;
        });
  
        return {
          district: {
            id: district.id,
            name: district.name,
          },
          totalCrimes: filteredCrimes.length,
        };
      });
  
      // Répondre avec les données
      res.status(200).json(crimesByDistrict);
    } catch (error) {
      console.error("Error fetching crimes by district and date range:", error);
      res.status(500).send({ error: "An error occurred" });
    }
  });

  
export default router;
