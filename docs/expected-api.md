NEV expects the following API endpoints. Example output is provided.

## /experiments/

```
[
  {
    "id": 1,
    "name": "Experiment 1"
  },
  {
    "id": 2,
    "name": "Experiment 2"
  }
]
```

## /experiments/[experiment-id]

```
{
  "id": 1,
  "name": "Experiment 1",
  "description": "Sed eget ex suscipit, tincidunt est aliquet, consectetur dolor. Proin eget malesuada ligula. Donec sed diam vel tellus ultrices lobortis vel ac neque. Fusce imperdiet, lectus vitae finibus bibendum, urna massa imperdiet erat, lobortis semper augue mauris non tellus. Proin at porttitor enim, nec rhoncus risus. Ut odio lorem, consequat ac aliquet a, scelerisque a felis. Suspendisse mattis bibendum quam quis feugiat. Aenean a feugiat nunc, quis pulvinar mi. Duis dapibus egestas lorem nec ultrices.",
  "contacts": [
    {
      "name": "John Karahalis",
      "email": "john@example.com"
    },
    {
      "name": "Rob Hudson",
      "email": "robh@example.com"
    },
    {
      "name": "Allen Short",
      "email": "allen@example.com"
    }
  ],
  "populations": {
    "control": {
      "total_pings": 100,
      "total_clients": 200
    },
    "group B": {
      "total_pings": 300,
      "total_clients": 500
    }
  },
  "subgroups": [
    "All",
    "Windows",
    "Mac",
    "Linux"
  ],
  "metrics": [
    1,
    2,
    3,
    4,
    5
  ]
}
```

## /metrics/[metric-id]

```
{
  "id": 1,
  "name": "Metric 1",
  "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget semper eros, ac tempus neque. Ut ipsum turpis, commodo sed nisi at, sollicitudin placerat augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer tristique euismod elit et varius. Donec ut pretium ligula, a commodo diam. Vivamus auctor auctor ligula, eget volutpat nisi lobortis ac. Donec sit amet venenatis nisi. Sed gravida purus nulla, at ullamcorper ligula ullamcorper non. Mauris venenatis quam non arcu pharetra, ut aliquam nibh sodales. Nullam tincidunt viverra lacinia. Suspendisse quis egestas mi, sit amet dignissim purus. Curabitur auctor leo eu dictum tincidunt. Proin vestibulum molestie dolor a gravida.",
  "units": {
    "x": "GPUs"
  },
  "populations": [
    {
      "name": "control",
      "data": [
        {
          "x": 2184,
          "y": 56.695
        },
        {
          "x": 6231,
          "y": 88.274
        },
        {
          "x": 2417,
          "y": 2.077
        },
        {
          "x": 3930,
          "y": 50.712
        },
        {
          "x": 2635,
          "y": 42.419
        },
        {
          "x": 8561,
          "y": 59.392
        },
        {
          "x": 3461,
          "y": 73.33
        },
        {
          "x": 9129,
          "y": 76.774
        },
        {
          "x": 7065,
          "y": 91.684
        },
        {
          "x": 5105,
          "y": 91.899
        }
      ]
    },
    {
      "name": "group B",
      "data": [
        {
          "x": 945,
          "y": 93.539
        },
        {
          "x": 7232,
          "y": 18.947
        },
        {
          "x": 4518,
          "y": 88.949
        },
        {
          "x": 5702,
          "y": 31.734
        },
        {
          "x": 7911,
          "y": 47.293
        },
        {
          "x": 2909,
          "y": 38.256
        },
        {
          "x": 4944,
          "y": 66.288
        },
        {
          "x": 3806,
          "y": 13.844
        },
        {
          "x": 4072,
          "y": 96.82
        },
        {
          "x": 4891,
          "y": 99.031
        }
      ]
    }
  ]
}
```
