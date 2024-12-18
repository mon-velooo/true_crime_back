const { Client } = require("pg");
const axios = require("axios");
const uuid = require("uuid"); // Pour générer des UUID pour la table Crime

export const client = new Client({
  host: "postgres", // Remplacez par votre hôte PostgreSQL
  port: 5432, // Remplacez par votre port PostgreSQL
  database: "db_true_crime", // Remplacez par le nom de votre base de données
  user: "user", // Remplacez par votre utilisateur
  password: "azerty", // Remplacez par votre mot de passe
});

// Fonction pour vider toutes les tables
async function truncateTables() {
  try {
    /*     console.log("Vidage des tables...");
     */ await client.query(
      'TRUNCATE TABLE "crime", "location_description", "district", "location_type", "age_group", "gender", "status", "law_category", "person", "offence" CASCADE'
    );
    /*     console.log("Toutes les tables ont été vidées.");
     */
  } catch (error) {
    /*     console.error('Erreur lors du vidage des tables:', error);
     */
  }
}

// Fonction pour insérer une valeur dans la table Location_Description (et autres similaires)
async function getOrInsert(table: any, column: any, value: any) {
  /*     console.log(table, column, value);
   */
  // Si la valeur est null, vide ou "(null)", on retourne null sans rien insérer
  if (!value || value === "(null)") {
    /*         console.log("Valeur null")
     */ return null;
  }

  /*     console.log("Valeur pas null")
   */
  /*     console.log(`SELECT id FROM "${table}" WHERE "${column}" = $1`, [value])
   */ // Vérifier si la valeur existe déjà dans la table
  const res = await client.query(
    `SELECT id FROM "${table}" WHERE "${column}" = $1`,
    [value]
  );
  if (res.rows.length > 0) {
    /*         console.log("La valeur existe déjà")
     */ return res.rows[0].id; // Si la valeur existe, retourne l'ID
  }

  /* console.log("La valeur n'existe pas")
  
    console.log(`INSERT INTO "${table}"("${column}") VALUES($1) RETURNING id`, [value]) */
  // Si la valeur n'existe pas, l'insérer et retourner l'ID
  const insertRes = await client.query(
    `INSERT INTO "${table}"("${column}") VALUES($1) RETURNING id`,
    [value]
  ); /* 
    console.log("ICI")
    console.log(insertRes.rows[0].id) */
  return insertRes.rows[0].id;
}

async function insertCrime(data: any) {
  const crimeId = uuid.v4(); // Générer un UUID pour la table Crime

  // Traitement de la date et de l'heure de début
  const startDate = data.cmplnt_fr_dt; // Date de début de l'incident (format : YYYY-MM-DD)
  let startTime = data.cmplnt_fr_tm ? data.cmplnt_fr_tm : "00:00:00"; // Heure de début, défaut à '00:00:00' si absente

  // Traitement de la date et de l'heure de fin, si disponibles
  const endDate = data.cmplnt_to_dt ? data.cmplnt_to_dt : startDate; // Si la date de fin est absente, on utilise la date de début
  let endTime =
    data.cmplnt_to_tm === "(null)"
      ? null
      : data.cmplnt_to_tm
      ? data.cmplnt_to_tm
      : null; // Si endTime est '(null)', on utilise `null`
  /* 
    console.log("-----------")
    console.log("startDate:", startDate);
    console.log("startTime:", startTime);
    console.log("endDate:", endDate);
    console.log("endTime:", endTime);
    console.log("-----------") */

  // Vérification des valeurs de latitude et longitude
  const latitude = data.latitude ? data.latitude : null; // Utilisation de null si la latitude est absente
  const longitude = data.longitude ? data.longitude : null; // Utilisation de null si la longitude est absente

  // Récupérer ou insérer les valeurs associées aux clés étrangères
  const locationDescriptionId = await getOrInsert(
    "location_description",
    "description",
    data.loc_of_occur_desc
  );
  const districtId = await getOrInsert("district", "name", data.boro_nm);
  const locationTypeId = await getOrInsert(
    "location_type",
    "label",
    data.prem_typ_desc
  );
  const suspectPersonId = await getOrInsertPerson(
    data.susp_age_group,
    data.susp_sex
  );
  const victimPersonId = await getOrInsertPerson(
    data.vic_age_group,
    data.vic_sex
  );
  const lawCatId = await getOrInsert("law_category", "label", data.law_cat_cd);
  const statusId = await getOrInsert("status", "label", data.crm_atpt_cptd_cd);
  const offenceId = await getOrInsertOffence(data.pd_cd, data.pd_desc);

  // Vérification si latitude et longitude sont présentes
  if (latitude === null || longitude === null) {
    /*       console.log(`Skipping crime ${crimeId} due to missing latitude/longitude`);
     */ return; // Saute l'insertion si latitude ou longitude est manquant
  }

  // Calculez la valeur de location en utilisant les valeurs de latitude et de longitude
  const location = `SRID=4326;POINT(${longitude} ${latitude})`;

  // Insérer les données dans la table Crime
  await client.query(
    `INSERT INTO "crime"("id", "start_date", "start_time", "end_date", "end_time", "latitude", "longitude", "location", "description", "districtId", "locationDescriptionId", "locationTypeId", "suspectPersonId", "victimPersonId", "statusId", "lawCategoryId", "offenceId")
       VALUES($1, $2, $3, $4, $5, $6, $7, ST_GeogFromText($8), $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
    [
      crimeId,
      startDate, // Assurez-vous que c'est une date au format YYYY-MM-DD
      startTime, // Assurez-vous que c'est une heure au format HH:mm:ss (ajouté une valeur par défaut ici)
      endDate, // Assurez-vous que c'est une date au format YYYY-MM-DD
      endTime, // Assurez-vous que c'est une heure au format HH:mm:ss (ajouté une valeur par défaut ici)
      latitude,
      longitude,
      location,
      data.ofns_desc, // Description du crime
      districtId,
      locationDescriptionId,
      locationTypeId,
      suspectPersonId,
      victimPersonId,
      statusId,
      lawCatId,
      offenceId,
    ]
  );
}

// Fonction pour insérer ou récupérer une personne dans la table Person
// Fonction pour insérer ou récupérer une personne dans la table Person
async function getOrInsertOffence(code: string, description: string) {
  // Vérifier si l'âge ou le sexe sont manquants et les remplacer par une valeur par défaut
  if (!code || code === "(null)") {
    code = "UNKNOWN";
  }
  if (!description || description === "(null)") {
    description = "UNKNOWN";
  }

  // Vérifier si l'infraction existe déjà (par combinaison code et description)
  const res = await client.query(`SELECT id FROM "offence" WHERE "code" = $1`, [
    code,
  ]);

  if (res.rows.length > 0) {
    return res.rows[0].id; // Si l'infraction existe déjà, retourne l'ID
  }

  // Si l'infraction n'existe pas, l'insérer
  const insertRes = await client.query(
    `INSERT INTO "offence"("code", "description") VALUES($1, $2) RETURNING id`,
    [code, description]
  );
  return insertRes.rows[0].id;
}

// Fonction pour insérer ou récupérer une personne dans la table Person
// Fonction pour insérer ou récupérer une personne dans la table Person
async function getOrInsertPerson(ageGroup: any, gender: any) {
  // Vérifier si l'âge ou le sexe sont manquants et les remplacer par une valeur par défaut
  if (!ageGroup || ageGroup === "(null)" || ageGroup < 0 || ageGroup > 100) {
    ageGroup = "UNKNOWN";
  }
  if (!gender || gender === "(null)" || (gender !== "M" && gender !== "F")) {
    gender = "U";
  }

  const ageGroupId = await getOrInsert("age_group", "range", ageGroup);
  const genderId = await getOrInsert("gender", "label", gender);

  // Vérifier si la personne existe déjà (par combinaison age_group_id et gender_id)
  const res = await client.query(
    `SELECT id FROM "person" WHERE "ageGroupId" = $1 AND "genderId" = $2`,
    [ageGroupId, genderId]
  );

  if (res.rows.length > 0) {
    return res.rows[0].id; // Si la personne existe déjà, retourne l'ID
  }

  // Si la personne n'existe pas, l'insérer
  const insertRes = await client.query(
    `INSERT INTO "person"("ageGroupId", "genderId") VALUES($1, $2) RETURNING id`,
    [ageGroupId, genderId]
  );
  return insertRes.rows[0].id;
}

// Fonction pour récupérer les données de l'API
export async function fetchData() {
  try {
    await truncateTables(); // Vider les tables avant d'insérer les nouvelles données
    const res = await axios.get(
      "https://data.cityofnewyork.us/resource/5uac-w243.json?$limit=500000"
    );
    for (const data of res.data) {
      /*       console.log(`Insertion du crime avec id: ${data.cmplnt_num}`);
       */ await insertCrime(data);
    }
    /*     console.log('Toutes les données ont été insérées.');
     */
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
  }
}
