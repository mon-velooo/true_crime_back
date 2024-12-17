import express, { Request, Response } from "express";
import * as service from "../../services/sports.service";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const sports = await service.getSports();
        res.status(200).send(sports);
    } catch (error) {
        res.status(500).send({ error: "An error occurred" });
    }
});

router.get("/fields", async (req: Request, res: Response) => {
    try {
        const sportFields = await service.getSportFields();
        res.status(200).send(sportFields);
    } catch (error) {
        res.status(500).send({ error: "An error occurred" });
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sport = await service.getDetailSport(id);
        res.status(200).send(sport);
    } catch (error) {
        res.status(500).send({ error: "An error occurred" });
    }
});

export default router;