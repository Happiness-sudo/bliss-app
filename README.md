
BLISS

BLISS is a small internal tool for running a freelance writing operation
with three kinds of people: an employer who owns the business, bidders who
go out and win writing jobs from clients, and writers who actually produce
the work.

I built this because "employer posts a job, freelancer applies" marketplace
apps don't really match how a lot of writing agencies actually work. In this
model, the client never touches the platform at all. A bidder wins a job
somewhere else - Upwork, a cold email, a referral, whatever - and logs it
here with an order number, the client's instructions, and how much it pays.
They assign it to a writer on the team. The writer does the work and submits
it back. The bidder reviews it, sends it off to the client, and marks it
paid once the money comes in. The employer sits above all of it and can see
every order, every bidder, and every writer at a glance.

The three roles

Employer
Signs up first (this is the only role that can self-register). Once in,
they add bidders and writers to their team from the Team page, and their
dashboard shows every order across the whole operation - who's assigned
what, what's been paid, what hasn't.

Bidder
Created by an employer, not self-signup. Logs new orders (order number,
instructions, page count, payment amount), assigns them to a writer from
the team, and moves each order through review once the writer delivers -
sent to client, then marked paid.

Writer
Also created by an employer. Sees only the orders assigned to them, works
through the instructions, and submits the finished piece back to the
bidder when it's done.

An order's life looks like this, start to finish:


What's actually in here

Backend - Flask, SQLite, JWT auth
Frontend - React, Tailwind, Vite

I picked SQLite on purpose. This isn't trying to be a scalable SaaS product
yet, it's a working tool for one team, and a single file database is one
less thing to manage. If it ever needs to grow past that, swapping the
connection string in `config.py` for Postgres is a small job, not a
rewrite.

Project layout

BLISS/
├── backend/
│ ├── app.py Flask app, registers all the routes
│ ├── config.py Database URL, JWT secret, etc.
│ ├── models.py User and Order tables
│ ├── requirements.txt
│ └── routes/
│ ├── auth.py Employer signup, login for all three roles
│ ├── team.py Employer adds/removes bidders and writers
│ └── orders.py The whole order lifecycle
└── frontend/
└── src/
├── api.js Every call to the backend lives here
├── App.jsx Routes, and who's allowed to see what
├── pages/
│ ├── Login.jsx
│ ├── Signup.jsx
│ ├── TeamManagement.jsx
│ ├── EmployerDashboard.jsx
│ ├── BidderDashboard.jsx
│ └── WriterDashboard.jsx
└── components/
├── Navbar.jsx
├── OrderCard.jsx
└── StatCard.jsx




Running it locally

You need two terminals open at once - one for the backend, one for the
frontend. Neither is much use without the other.

Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

If that worked, it'll say `Running on http://127.0.0.1:5000`. A SQLite file
called `bliss.db` gets created automatically the first time you run this -
you don't need to set up a database yourself.

Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend talks to the backend through a
proxy, so both need to be running for anything to actually work.

Trying it out for the first time

1. Go to `/signup` and create an employer account. This is the only role
   that signs up directly.
2. Click **Team** in the nav and add a bidder and a writer - you're just
   giving them a name, email, and a password.
3. Log out, log back in as the bidder, and log a new order: give it an
   order number, write out the instructions, set a page count and a
   payment amount, and assign it to the writer you just added.
4. Log out again, log in as the writer, and you'll see that order waiting.
   Submit some placeholder text as the finished work.
5. Log back in as the bidder - the order now shows as submitted. Mark it
   sent to client, then mark it paid.
6. Log in as the employer one more time and you'll see the whole thing
   reflected on the dashboard: the order, who worked it, and that it's
   been paid.

That loop is the whole point of the app.



Things that aren't built yet

This is a working MVP, not a finished product. Some obvious next steps,
roughly in the order I'd tackle them:

- File uploads, so writers can hand back an actual document instead of
  pasting text into a box
- Deadlines and some kind of reminder when an order is close to due
- Search and filtering on the orders list - right now everything's just a
  flat list, which is fine until there are fifty orders in it
- A password reset flow
- Actual payment processing, instead of a bidder just clicking "mark paid"
- Some form of notification when an order changes status, so a writer
  isn't just refreshing the dashboard to see if something new landed

If you're picking this up and want to build one of these next, the order
model in `models.py` is the place to start reading.
EOF

echo "README written:"
wc -l README.md
