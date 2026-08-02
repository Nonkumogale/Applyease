import { Router, type IRouter } from "express";
import healthRouter from "./health";
import applicantsRouter from "./applicants";
import documentsRouter from "./documents";
import applicationsRouter from "./applications";
import credentialsRouter from "./credentials";
import verificationRouter from "./verification";
import eventsRouter from "./events";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(applicantsRouter);
router.use(documentsRouter);
router.use(applicationsRouter);
router.use(credentialsRouter);
router.use(verificationRouter);
router.use(eventsRouter);
router.use(dashboardRouter);

export default router;
