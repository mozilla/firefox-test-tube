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

Line chart:

```
{
  "id": 1,
  "name": "Metric 1",
  "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget semper eros, ac tempus neque. Ut ipsum turpis, commodo sed nisi at, sollicitudin placerat augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer tristique euismod elit et varius. Donec ut pretium ligula, a commodo diam. Vivamus auctor auctor ligula, eget volutpat nisi lobortis ac. Donec sit amet venenatis nisi. Sed gravida purus nulla, at ullamcorper ligula ullamcorper non. Mauris venenatis quam non arcu pharetra, ut aliquam nibh sodales. Nullam tincidunt viverra lacinia. Suspendisse quis egestas mi, sit amet dignissim purus. Curabitur auctor leo eu dictum tincidunt. Proin vestibulum molestie dolor a gravida.",
  "n": 32082,
  "type": "line",
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

Bar chart:

```
{
  "id": 2,
  "name": "Metric 2",
  "description": "Ut lacus nunc, cursus vitae leo et, dignissim rhoncus augue. Quisque feugiat molestie justo sit amet vestibulum. Phasellus urna velit, condimentum nec tortor vel, imperdiet commodo ligula. Etiam maximus erat non lacus aliquet porta. Phasellus eget luctus enim. Fusce ultrices tellus ut ultrices pretium. Ut ultricies ex hendrerit leo posuere laoreet. Aliquam erat volutpat. Aenean condimentum fringilla massa, a ultricies ex accumsan et. Integer bibendum lorem vel semper pulvinar. Vivamus id nisl ullamcorper massa ullamcorper suscipit vestibulum in tellus. Etiam elementum purus sit amet viverra sodales. Integer lacinia nisi at efficitur blandit. In imperdiet vehicula mauris, vitae pharetra urna porta sit amet. Morbi ut rhoncus augue, ac dictum enim.",
  "n": 23701,
  "type": "bar",
  "categories": [
    "News",
    "Sports",
    "Social media",
    "Other"
  ],
  "units": {
    "x": "Website category",
    "y": "Visits"
  },
  "populations": [
    {
      "name": "control",
      "data": [
        2305,
        3252,
        1355,
        4213
      ]
    },
    {
      "name": "group B",
      "data": [
        1351,
        2356,
        3252,
        2351
      ]
    }
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
