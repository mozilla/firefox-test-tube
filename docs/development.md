# Install and build

1. Install yarn globally (`npm install --global yarn` or `brew install yarn`,
   for example)
2. From the project root, run `yarn`
3. From the project root, run `make build`

# Run

1. From the project root, run `docker-compose up`
2. In another terminal, also from the project root, run `yarn start`

# Working with Test Tube

## Use production data locally

It can be useful to use production data locally. To do this, we make a backup of
the production Experiments Viewer data on Heroku, download the backup, and
import it into the Docker container's database.

**NOTE**: These steps assume that you have a clone of the
[experiments-viewer](https://github.com/mozilla/experiments-viewer) project,
that you have admin access to the moz-experiments-viewer Heroku app, and that
you have a Git remote named "prod" which tracks the moz-experiments-viewer
Heroku app.

1. Download a new backup of the production Experiments Viewer site.
    1. Navigate to your local clone of the experiments-viewer project
    2. Run `heroku pg:backups:capture --remote prod`
    3. Run `heroku pg:backups:download --remote prod -o latest.dump b001` (where
    `b001` is the identifier that appeared in the previous command)
2. Move *latest.dump* from your clone of experiments-viewer to your clone of
   firefox-test-tube.
3. Import the database
    1. Run `make shell`
    2. Run `pg_restore -h db -U postgres -d postgres --clean latest.dump`

## Front-end dependency management

### Add a dependency

Run `yarn add example-package-name`

### Remove a dependency

Run `yarn remove example-package-name`

## Use Test Tube outside of Mozilla

To run Test Tube outside of Mozilla, be sure to disable authentication or obtain
your own private keys.
