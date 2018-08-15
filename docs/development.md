# Install and build

1. [Install Node and NPM](https://nodejs.org/en/download/)
2. From the project root, run `npm install`
3. From the project root, run `npm run build`

# Run

1. From the project root, run `docker-compose up`
2. In another terminal, also from the project root, run `npm start`

# Test

`npm test`

# Working with Test Tube

## Use production data locally

It can be useful to use production data locally. To do this, we make a backup of
the production data on Heroku, download the backup, and import it into the
Docker container's database.

1. Download a new backup of the production site.
    1. Navigate to your local clone of the project
    2. Run `heroku pg:backups:capture --remote prod`
    3. Run `heroku pg:backups:download --remote prod -o latest.dump b001` (where
    `b001` is the identifier that appeared in the previous command)
3. Import the database
    1. Run `docker-compose run server bash`
    2. Run `pg_restore -h db -U postgres -d postgres --clean latest.dump`

## Use Test Tube outside of Mozilla

To run Test Tube outside of Mozilla, be sure to disable authentication or obtain
your own private keys.
