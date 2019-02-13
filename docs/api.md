# API

## Endpoints


### `GET /v2/experiments/`

Lists the ID and name of all experiments.

Example output:

```
{
  "experiments": [
    {
      "id": 1,
      "name": "Experiment 1",
      "slug": "experiment-1",
      "enabled": true,
      "creationDate": "2018-05-09"
    },
    ...
  ]
}
```


### `GET /v2/experiments/[experiment-slug]/`

Lists the details of the provided experiment, including populations and metrics.

Example output:

```
{
  "id": 1,
  "name": "Experiment 1",
  "description": "",
  "authors": [],
  "populations": {
    "control": {
      "total_pings": 45678,
      "total_clients": 1234
    },
    "variant": {
      "total_pings": 49586,
      "total_clients": 1423
    }
  },
  "subgroups": ["All"],
  "metrics": [
    {
      "id": 1,
      "name": "Metric A"
    },
    ...
  ]
}
```
