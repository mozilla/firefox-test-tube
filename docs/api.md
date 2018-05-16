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


### `GET /v2/experiments/[experiment-id]/metrics/[metric-id]/`

Returns data for a specific metric, grouped by the population, if provided.

Example output:

```
{
  "id": 303,
  "name": "Max Concurrent Tabs"
  "type": "UintScalar",
  "description": "",
  "populations": [
    {
      "name": "control",
      "n": 46647
      "data": [
        {
          "x": 0,
          "y": 0.0011361931099535,
          "count": 53
        },
        {
          "x": 1,
          "y": 0.177417625999528,
          "count": 8276
        },
        ...
      ],
      "stats": {
        "mean": {
          "value": 18.8009518296997,
          "confidence_low": 10.8968692052197,
          "confidence_high": 26.7048498397542,
          "confidence_level": 0.01
        }
      }
    },
    {
      "data": [
        "name": "variant",
        "n": 45970
        {
          "x": 0,
          "y": 0.0017185120730912,
          "count": 79
        },
        {
          "x": 1,
          "y": 0.17319991298673,
          "count": 7962
        },
        ...
      ],
      "stats": {
        "mean": {
          "value": 25.102458124864,
          "confidence_low": 9.5981952612705,
          "confidence_high": 40.6056987459798,
          "confidence_level": 0.01
        }
      }
    }
  ],
  "units": {
    "x": ""
  },
}
```

