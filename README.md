# audio-annotator

[![License](https://img.shields.io/badge/license-see%20LICENSE.txt-blue.svg)](LICENSE.txt)

A JavaScript web interface for annotating audio data, adapted for emotion annotation in order to build a dataset for Speech Emotion Recognition (SER).

This project is a fork of [CrowdCurio/audio-annotator](https://github.com/CrowdCurio/audio-annotator), adapted for annotating emotions in a medical context (ECOS simulations). The whole UI is in French to support French-speaking annotators.

Developed by [Stefanie Mikloska](https://github.com/StefanieMikloska), the [CrowdLab @ University of Waterloo](http://edithlaw.ca/people.html) and [MARL @ New York University](http://steinhardt.nyu.edu/marl/).

## Table of contents

- [Features](#features)
- [Demo](#demo)
- [Getting started](#getting-started)
- [Audio credits](#audio-credits)
- [Visualizations](#visualizations)
- [Project structure](#project-structure)
- [Citation and license](#citation-and-license)

## Features

Compared to the original repository, the following features were added:

- **Audio transcription**: each clip can be accompanied by a transcript generated with [WhisperX](https://github.com/m-bain/whisperX) and shown as subtitles. Even when imperfect, it gives the annotator useful context and clues, especially for difficult medical vocabulary.
- **Audio description**: a short description of the source video can be displayed alongside the transcript to give general context. The name of the playing file is also shown, which in our case carries contextual information.
- **Likert scale and definitions**: each clip is rated from 1 to 7 on four emotions (in our use case: *Calme / assurance*, *Empathie / chaleur*, *Impatience / irritation*, *Froideur / détachement*), with each emotion's definition displayed on screen.
- **Comment box**: an optional free-text field, placed just above the submit button, lets annotators report anything odd about the audio or hesitations about the labelling.
- **Mandatory listening**: the annotator must listen to the clip once before being able to grade it, to prevent careless or spam labelling.

The following features from the original repository were removed as irrelevant to this use case:

- Selecting a region in the visualization (each clip is annotated as a whole).
- Real-time feedback mechanisms based on user annotations.

## Demo

https://github.com/user-attachments/assets/9b9ad4a2-ab24-477b-befc-a0f4ab968272

## Getting started

**Requirements:** Python 3.

1. Clone the repository and move into the `audio-annotator/` directory.
2. Start the local server:
   ```bash
   python server.py
   ```
3. Open <http://localhost:8000/examples> in your browser. The demo uses the spectrogram visualization.

Submitted annotations are written to `results.jsonl` (listed in `.gitignore`).

The examples do not depend on any specific backend: they load a JSON file containing fake data to render the interface.

## Audio credits

The demo audio files were extracted from the first three videos of the YouTube channel [@GestesTechniquesECOS](https://www.youtube.com/@GestesTechniquesECOS):

0. Vidéo introductive
1. Massage cardiaque externe (adulte)
2. Ponction lombaire

The timestamps of each sample are encoded in its filename. For example, `0 - Vidéo introductive_sample_1_56.5426s-80.5853s.wav` covers the segment from 56.5426 s to 80.5853 s of the source video.

## Visualizations

The `wavesurfer.params.visualization` parameter accepts three values:

1. `invisible`: no visualization (blank rectangle)
2. `spectrogram`: the audio is displayed as a spectrogram
3. `waveform`: the audio is displayed as a waveform

## Project structure

```
audio-annotator/
├── server.py                 Local server: serves tasks and stores annotations
├── examples/
│   └── index.html            Main annotation interface (4 predefined emotions)
└── static/
    ├── css/
    │   ├── urban-ears.css        Custom styles for the interface
    │   └── materialize.min.css   Materialize CSS framework
    ├── json/
    │   ├── Description_test.json Description of the source video (context for the annotator)
    │   └── sample_data.json      Sample task data
    └── js/
        ├── colormap/
        │   ├── gen_colormap.sh   Generates colormap.min.js
        │   ├── gen_colormap.js   Input for gen_colormap.sh (defines the magma colour scheme)
        │   └── colormap.min.js   Generated colormap used by the spectrogram
        ├── lib/                  Unmodified external libraries
        └── src/
            ├── main.js                       UrbanEars: builds/updates the interface when a task loads, submits task data
            ├── annotation_stages.js          Annotation workflow: Likert scales, definitions, validation
            ├── components.js                 UI components: play bar, timestamps, workflow buttons
            ├── message.js                    User notifications (Materialize toasts)
            ├── hidden_image.js               Visual feedback mechanism (inherited, unused here)
            ├── wavesurfer.drawer.extended.js Spectrogram, waveform and invisible visualizations
            ├── wavesurfer.labels.js          Labels displayed above the visualization
            └── wavesurfer.regions.js         Modified wavesurfer.js regions plugin
```

To regenerate the colormap after editing `gen_colormap.js`, run `source gen_colormap.sh` from the `colormap/` directory.

## Citation and license

When used in academic work, please cite the original paper:

> M. Cartwright, A. Seals, J. Salamon, A. Williams, S. Mikloska, D. MacConnell, E. Law, J. Bello, and O. Nov. "Seeing sound: Investigating the effects of visualizations and complexity on crowdsourced audio annotations." *Proceedings of the ACM on Human-Computer Interaction*, 1(1), 2017.

License: see [LICENSE.txt](LICENSE.txt).
