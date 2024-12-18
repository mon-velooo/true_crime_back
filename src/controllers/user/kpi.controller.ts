import { Request, Response, Router } from "express";
import { AppDataSource } from "../../database/data-source";
import { Crime } from "../../models/Crime";
import { Between } from "typeorm";

const router = Router();

router.get("/getKpisByRange", async (req: Request, res: Response) => {
  try {
    const { rangeStartDate, rangeEndDate } = req.query;

    // Validation des dates
    if (!rangeStartDate || !rangeEndDate) {
      return res
        .status(400)
        .json({ error: "rangeStartDate and rangeEndDate are required" });
    }

    const start = new Date(rangeStartDate as string);
    const end = new Date(rangeEndDate as string);

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
        "NARCOTICS",
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
        "LARCENY, PETIT FROM STORE-SHOPL",
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
        "ASSAULT 2,1, UNCLASSIFIED",
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
          if (
            keywords.some((keyword) => offenceDescription.includes(keyword))
          ) {
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
    const percentDrugOffenses = totalCrime
      ? Math.round((totalDrugOffenses / totalCrime) * 100)
      : 0;
    const percentPropertyOffenses = totalCrime
      ? Math.round((totalPropertyOffenses / totalCrime) * 100)
      : 0;
    const percentPersonOffenses = totalCrime
      ? Math.round((totalPersonOffenses / totalCrime) * 100)
      : 0;
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

export default router;
