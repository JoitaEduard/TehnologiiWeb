const express = require('express');
const app = express();
const cors = require('cors');
const port = 4000;

const sequelize = require('./sequelize');

const JobPosting = require('./models/JobPosting');
const Candidate = require('./models/Candidate');

JobPosting.hasMany(Candidate);

//CORS
app.use(cors());

//Pentru POST
app.use(
    express.urlencoded({
        extended: true
    })
);
app.use(express.json());


app.listen(port, () => {
    console.log('The server is running on http://localhost:' + port);
})

//Error hanlder
app.use((err, req, res, next) => {
    console.log('ERROR!' + err);
    res.status(500).json({ message: '500 - Server Error' });
});

//Sincronizare baza de date
app.get('/sync', async (req, res, next) => {
    await sequelize.sync({ force: true });
    res.status(201).json({ message: 'DB created' });
})


//GET - prima entitate
app.get('/jobpostings', async (req, res, next) => {
    try {
        var sem = 0;
        const jobs = await JobPosting.findAll();

        //Filtrare
        if (req.query.descriere && req.query.deadline) {
            sem = 1;
            filteredJobs = await JobPosting.findAll({
                where: {
                    descriere: req.query.descriere,
                    deadline: req.query.deadline
                }
            })
            res.status(205).json(filteredJobs);
        }

        //Sortare
        if (req.xhr) {
            sem = 1;
            sortedJobs = await JobPosting.findAll({
                order: [
                    ['deadline', 'ASC']
                ]
            })
            res.status(206).json(sortedJobs);
        }

        //Paginare
        if (req.query.max && req.query.page) {
            sem = 1;
            var pagJobPostings;
            pagJobPostings = jobs.slice(req.query.page * req.query.max, (req.query.page + 1) * req.query.max);
            res.status(207).json(pagJobPostings);
        }

        if (sem == 0) {
            res.status(200).json(jobs);
        }

    } catch (err) {
        next(err)
    }
})

//POST - prima entitate
app.post('/jobpostings', async (req, res, next) => {
    try {
        await JobPosting.create(req.body);
        res.status(201).json({ message: "Job posting created" });
    } catch (err) {
        next(err);
    }
})

//PUT - prima entitate
app.put('/jobpostings/:jobId', async (req, res, next) => {
    try {
        const job = await JobPosting.findByPk(req.params.jobId);
        if (job) {
            job.descriere = req.body.descriere;
            job.deadline = req.body.deadline;
            await job.save();
            res.status(202).json({ message: "Job Posting Updated" });
        } else {
            res.sendStatus(404).json({ message: "Job Posting not found" });
        }
    } catch (err) {
        next(err);
    }
})

//DELETE - prima entitate
app.delete('/jobpostings/:jobId', async (req, res, next) => {
    try {
        const job = await JobPosting.findByPk(req.params.jobId, { include: Candidate });
        if (job) {
            await job.destroy();
            res.status(203).json({ message: 'Job Posting deleted' });
        } else {
            res.status(404).json({ message: 'Job Posting not found' });
        }
    } catch (err) {
        next(err);
    }
})

//GET - a doua entitate
app.get('/jobpostings/:jobId/candidates', async (req, res, next) => {
    try {
        const job = await JobPosting.findByPk(req.params.jobId, {
            include: [Candidate]
        });
        if (job) {
            res.status(200).json(job.candidates);
        } else {
            res.status(404).json({ message: 'Job Posting not found' });
        }
    } catch (err) {
        next(err);
    }
})

//POST - a doua entitate
app.post('/jobpostings/:jobId/candidates', async (req, res, next) => {
    try {
        const job = await JobPosting.findByPk(req.params.jobId);
        if (job) {
            const candidate = new Candidate(req.body);
            candidate.jobPostingId = job.id;
            await candidate.save();
            res.status(201).json({ message: 'Candidate created for job posting ' + job.id });
        } else {
            res.status(404).json({ message: 'Job Posting not found' });
        }
    } catch (err) {
        next(err);
    }
})

//PUT - a doua entitate
app.put('/jobpostings/:jobId/candidates/:candidateId', async (req, res, next) => {
    try {
        const job = await JobPosting.findByPk(req.params.jobId);
        if (job) {
            const candidates = await job.getCandidates({ id: req.params.candidateId });
            const candidate = candidates.shift();
            if (candidate) {
                candidate.nume = req.body.nume;
                candidate.cv = req.body.cv;
                candidate.email = req.body.email;
                await candidate.save();
                res.status(202).json({ message: 'Candidate updated' })
            } else {
                res.status(404).json({ message: 'Candidate not found' });
            }
        } else {
            res.status(404).json({ message: 'Job Posting not found' });
        }
    } catch (err) {
        next(err);
    }
})

//DELETE - a doua enitate
app.delete('/jobpostings/:jobId/candidates/:candidateId', async (req, res, next) => {
    try {
        const job = await JobPosting.findByPk(req.params.jobId);
        if (job) {
            const candidates = await job.getCandidates({ id: req.params.candidateId });
            const candidate = candidates.shift();
            if (candidate) {
                await candidate.destroy()
                res.status(203).json({ message: 'Candidate deleted' });
            } else {
                res.status(404).json({ message: 'Candidate not found' });
            }
        } else {
            res.status(404).json({ message: 'Job Posting not found' });
        }
    } catch (err) {
        netxt(err);
    }
})

//IMPORT
app.post('/', async (req, res, next) => {
    try {
        for (let j of req.body) {
            const job = await JobPosting.create(j);
            for (let c of j.candidates) {
                const candidate = await Candidate.create(c);
                job.addCandidate(candidate);
            }
            await job.save();
        }
        res.status(208).json({ message: 'Import made' });
    } catch (err) {
        next(err);
    }
})

//EXPORT
app.get('/', async (req, res, next) => {
    try {
        const jobs = await JobPosting.findAll({ include: [Candidate] });
        res.status(209).json(jobs);
    } catch (err) {
        next(err);
    }
})