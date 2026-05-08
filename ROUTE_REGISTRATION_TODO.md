# Route Registration TODO

Add these imports to the Express app file:

import chanceMeRouter from "./routes/chanceMe";
import studentJourneyRouter from "./routes/studentJourney";
import academicBioRouter from "./routes/academicBio";
import socialRankingsRouter from "./routes/socialRankings";

Then register:

app.use("/api/chance-me", chanceMeRouter);
app.use("/api/student-journey", studentJourneyRouter);
app.use("/api/academic-bio", academicBioRouter);
app.use("/api/social-rankings", socialRankingsRouter);

Frontend route suggestions:

/chance-me -> ChanceMe
/profile/:username -> include AcademicBioCard and StudentJourney
/rankings -> include SocialRankingsPanel
