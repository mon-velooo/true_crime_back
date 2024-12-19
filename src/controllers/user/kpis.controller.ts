import { Request, Response, Router } from "express";
import { AppDataSource } from "../../database/data-source";
import { Crime } from "../../models/Crime";
import { Between } from "typeorm";

import * as crimeService from "../../services/crimes.service";
import * as residentService from "../../services/residentsNumberByYears.service";
import { Kpi } from "../../types/stats/CrimeTypeStat";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
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
    const response: Kpi[] = [
      {
        title: "Nombre de crimes",
        value: totalFelony,
        type: "number",
      },
      {
        title: "Nombre de violations",
        value: totalViolation,
        type: "number",
      },
      {
        title: "Nombre de délits",
        value: totalMisdemeanor,
        type: "number",
      },
      {
        title: "Délits liés à la drogue",
        value: percentDrugOffenses,
        type: "percent",
      },
      {
        title: "Délits contre les biens",
        value: percentPropertyOffenses,
        type: "percent",
      },
      {
        title: "Délits contre les personnes",
        value: percentPersonOffenses,
        type: "percent",
      },
    ];

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching major crime stats:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/securityFeeling", async (req: Request, res: Response) => {
  try {
    const { rangeStartDate, rangeEndDate } = req.query;

    // Valider que les deux dates sont fournies
    if (!rangeStartDate || !rangeEndDate) {
      return res
        .status(400)
        .json({ error: "rangeStartDate and rangeEndDate are required" });
    }

    const start = new Date(rangeStartDate as string);
    const end = new Date(rangeEndDate as string);

    const totalCrimes = await crimeService.getTotalCrimeByRangeDate(
      rangeStartDate as string,
      rangeEndDate as string
    );

    // get total day of the range
    const totalDays =
      Math.abs(
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      ) + 1;

    console.log("totalCrimes", totalCrimes);
    console.log("totalDays", totalDays);

    // get average totalcrime per day
    const averageTotalCrimePerDay = totalCrimes / totalDays;

    console.log("averageTotalCrimePerDay", averageTotalCrimePerDay);

    // get average year of the range
    const year = Math.round(
      (start.getFullYear() + end.getFullYear()) / 2
    ).toString();

    // get total resident at the year
    const residentNumberAtYear = await residentService.residentsNumberByYears(
      year
    );

    if (!residentNumberAtYear) {
      return res.status(404).send({ error: "No data found" });
    }

    // Calcul du taux de criminalité pour 100 000 habitants
    const crimeRate =
      (averageTotalCrimePerDay / residentNumberAtYear.residents_number) *
      100000;

    // Calcul du sentiment de sécurité
    // On considère qu'un taux de 100 crimes/100k habitants donne un sentiment de 0
    const MAX_CRIME_RATE = 5;
    const securityFeeling = Math.max(
      0,
      Math.min(100, 100 * (1 - crimeRate / MAX_CRIME_RATE))
    );
    const securityFeelingRound = Number(securityFeeling.toFixed(0));

    const insecurityFeeling = 100 - securityFeelingRound;

    //Round data
    const crimeRateRound = Number(crimeRate.toFixed(2));

    res.status(200).send({
      crimeRate: crimeRateRound,
      securityFeeling: securityFeelingRound,
      insecurityFeeling: insecurityFeeling,
    });
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

export default router;
