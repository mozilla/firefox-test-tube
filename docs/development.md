# Install and build

1. Install yarn globally (`npm install --global yarn` or `brew install yarn`,
   for example)
2. From the project root, run `yarn`
3. From the project root, run `make build`

## Notes

To run Test Tube outside of Mozilla, be sure to disable authentication or obtain
your own private keys.

# Run

1. From the project root, run `docker-compose up`
2. In another terminal, also from the project root, run `yarn start`

## Appendix

### Front-end dependency management

#### Adding a dependency

Run `yarn add example-package-name`

#### Remove a dependency

Run `yarn remove example-package-name`
