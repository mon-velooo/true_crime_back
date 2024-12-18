import { Request, Response, Router } from "express";
import { AppDataSource } from "../../database/data-source";
import { Crime } from "../../models/Crime";
import { Offence } from "../../models/Offence";
import { Status } from "../../models/Status";
import { District } from "../../models/District";
import { LawCategory } from "../../models/LawCategory";
import { CrimeTypeStats } from "../../types/stats/CrimeTypeStat";
import { Between } from "typeorm";


const router = Router();


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

      // Trier les statistiques par totalCrimeType en ordre décroissant
      const sortedOffencesStats = Object.values(offencesStats).sort((a, b) => b.totalCrimeType - a.totalCrimeType);

      // Construire la réponse finale
      const response: CrimeTypeStats = {
          totalCrime,
          offencesStats: sortedOffencesStats,
      };

      res.status(200).json(response);
  } catch (error) {
      console.error("Error fetching crimes stats:", error);
      res.status(500).send({ error: "An error occurred" });
  }
});


router.get("/getKpisByRange", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Validation des dates
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Récupération du repository Crime
    const crimeRepository = AppDataSource.getRepository(Crime);

    // Requête pour récupérer les crimes majeurs sur la période
    const crimesInRange = await crimeRepository.find({
      where: {
        start_date: Between(
          start.toISOString().split("T")[0],
          end.toISOString().split("T")[0]
        ),
      },
      relations: ["lawCategory", "offence"], // Inclure les relations nécessaires
    });

    // Liste des catégories pour offenses
    const categories = {
      drugOffenses: [
        "CONTROLLED SUBSTANCE, SALE", 
        "CONTROLLED SUBSTANCE, POSSESSI", 
        "CONTROLLED SUBSTANCE, INTENT TO",
        "DRUG", 
        "NARCOTICS"
      ],
      propertyOffenses: [
        "LARCENY",
        "BURGLARY",
        "ROBBERY",
        "CRIMINAL MISCHIEF",
        "FRAUD",
        "FORGERY",
        "UNAUTHORIZED USE VEHICLE",
        "DISORDERLY CONDUCT",
        "TRESPASS",
        "LARCENY, GRAND BY FALSE PROMISE-NOT IN PERSON CONTACT",
        "LARCENY, PETIT FROM STORE-SHOPL",
        "LARCENY, GRAND FROM VEHICLE/MOTORCYCLE",
        "LARCENY, GRAND BY BANK ACCT COMPROMISE-REPRODUCED CHECK",
        "LARCENY, PETIT FROM AUTO",
        "LARCENY, GRAND FROM RESIDENCE/BUILDING, UNATTENDED, PACKAGE THEFT OUTSIDE",
        "LARCENY, PETIT FROM STORE-SHOPL"
      ],
      personOffenses: [
        "ASSAULT",
        "HARASSMENT",
        "STRANGULATION",
        "RESISTING ARREST",
        "MENACING",
        "OBSTR BREATH/CIRCUL",
        "VIOLATION OF ORDER OF PROTECTI",
        "ASSAULT 3",
        "ASSAULT 2,1, UNCLASSIFIED",
        "AGGRAVATED HARASSMENT 2",
        "STRANGULATION 1ST",
        "ASSAULT POLICE/PEACE OFFICER",
        "AGGRAVATED HARASSMENT 1",
        "HARASSMENT, SUBD 1, CIVILIAN",
        "AGGRAVATED HARASSMENT 2",
        "ASSAULT 2,1, UNCLASSIFIED"
      ],
      /* otherOffenses: [
        "SODOMY 3",
        "ROBBERY, BEGIN AS SHOPLIFTING",
        "LEAVING SCENE-ACCIDENT-PERSONA",
        "TRAFFIC, UNCLASSIFIED MISDEMEAN",
        "MISCHIEF, CRIMINAL 3 & 2, OF M",
        "NY STATE LAWS, UNCLASSIFIED FEL",
        "RECKLESS ENDANGERMENT 1",
        "IMPERSONATION, UNCLASSIFIED",
        "VIOLATION OF ORDER OF PROTECTI",
        "WEAPONS, POSSESSION, ETC",
        "CHILD, ENDANGERING WELFARE",
        "MATERIAL OFFENSIV",
        "RAPE 1",
        "BURGLARY, COMMERCIAL, NIGHT",
        "CRIMINAL POSSESSION WEAPON",
        "MISCHIEF, CRIMINAL, UNCL 2ND"
      ] */
    };
    
    

    // Variables pour le calcul global des KPIs
    let totalFelony = 0;
    let totalViolation = 0;
    let totalMisdemeanor = 0;
    let totalDrugOffenses = 0;
    let totalPropertyOffenses = 0;
    let totalPersonOffenses = 0;
    /* let totalOtherOffenses = 0; */

    crimesInRange.forEach((crime) => {
      const lawCategoryLabel = crime.lawCategory?.label?.toUpperCase();
      const offenceDescription = crime.offence?.description?.toUpperCase();

      // Comptage des catégories de loi (LawCategory)
      if (lawCategoryLabel === "FELONY") {
        totalFelony += 1;
      }
      if (lawCategoryLabel === "VIOLATION") {
        totalViolation += 1;
      }
      if (lawCategoryLabel === "MISDEMEANOR") {
        totalMisdemeanor += 1;
      }

      // Comptage des types d'infractions (Offence) basées sur les catégories
      if (offenceDescription) {
        Object.entries(categories).forEach(([category, keywords]) => {
          if (keywords.some((keyword) => offenceDescription.includes(keyword))) {
            // Ajout du comptage pour la catégorie appropriée
            switch (category) {
              case "drugOffenses":
                totalDrugOffenses += 1;
                break;
              case "propertyOffenses":
                totalPropertyOffenses += 1;
                break;
              case "personOffenses":
                totalPersonOffenses += 1;
                break;
              /* case "otherOffenses":
                totalOtherOffenses += 1;
                break; */
            }
          }
        });
      }
    });

    // Calcul du total général
    const totalCrime = crimesInRange.length;

    // Calcul des pourcentages
    const percentDrugOffenses = totalCrime ? Math.round((totalDrugOffenses / totalCrime) * 100) : 0;
    const percentPropertyOffenses = totalCrime ? Math.round((totalPropertyOffenses / totalCrime) * 100) : 0;
    const percentPersonOffenses = totalCrime ? Math.round((totalPersonOffenses / totalCrime) * 100) : 0;
    /* const percentOtherOffenses = totalCrime ? Math.round((totalOtherOffenses / totalCrime) * 100) : 0;  */   

    // Construction de la réponse finale avec KPIs
    const response = {
      kpis: {
        countFelony: totalFelony,
        countViolation: totalViolation,
        countMisdemeanor: totalMisdemeanor,
        percentDrugOffenses: percentDrugOffenses,
        percentPropertyOffenses: percentPropertyOffenses,
        percentPersonOffenses: percentPersonOffenses,
        /* percentOtherOffenses: percentOtherOffenses, */
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching major crime stats:", error);
    res.status(500).json({ error: "An error occurred" });
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

    // Vérifier si startDate est avant endDate
    if (start > end) {
      return res.status(400).json({ error: "startDate must be before endDate" });
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


router.get("/getStatusByRange", async (req: Request, res: Response) => {
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
          relations: ["status"], // Inclure les relations avec les statuts
      });

      // Calculer les statistiques par statut
      const statusStats = crimesInRange.reduce((acc, crime) => {
          const statusId = crime.status.id;

          if (!acc[statusId]) {
              acc[statusId] = {
                  status: crime.status,
                  totalCrimeStatus: 0,
              };
          }

          acc[statusId].totalCrimeStatus += 1;
          return acc;
      }, {} as Record<number, { status: Status; totalCrimeStatus: number }>);

      // Trier les statistiques par totalCrimeStatus en ordre décroissant
      const sortedStatusStats = Object.values(statusStats).sort((a, b) => b.totalCrimeStatus - a.totalCrimeStatus);

      // Construire la réponse finale
      const response = {
          totalCrime: crimesInRange.length,
          statusStats: sortedStatusStats,
      };

      res.status(200).json(response);
  } catch (error) {
      console.error("Error fetching crime status stats:", error);
      res.status(500).send({ error: "An error occurred" });
  }
});




export default router;
