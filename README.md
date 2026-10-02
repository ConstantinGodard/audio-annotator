# audio-annotator

[![MIT licensed](https://img.shields.io/badge/license-BSD2-blue.svg)](https://github.com/CrowdCurio/audio-annotator/blob/master/LICENSE.txt)

Javascript web interface for annotating audio data, adapted for emotion detection in order to create a dataset for Speech Emotion Recognition.

Developed by [StefanieMikloska](github.com/StefanieMikloska), [CrowdLab @ Univertsity of Waterloo](http://edithlaw.ca/people.html) and [MARL @ New York University](http://steinhardt.nyu.edu/marl/).

When used in academic work please cite:

> M. Cartwright, A. Seals, J. Salamon, A. Williams, S. Mikloska, D. MacConnell, E. Law, J. Bello, and O. Nov. "Seeing sound: Investigating the effects of visualizations and complexity on crowdsourced audio annotations." In *Proceedings of the ACM on Human-Computer Interaction*, 1(1), 2017.

### Description
audio-annotator is a web interface that allows users to annotate audio recordings, which was then adapted for emotion detection in order to create a dataset for Speech Emotion Recognition. Every feature useless for emotion annotation was therfore removed from the initial repository. The usecase of this repository is for french emotion annotation, therefore, every single sentences in the UI web app is in french, hence helping french speaking annotators.

It has 3 types of audio visualizations (wavesurfer.params.visualization)
   1. invisible (appears as a blank rectangle)
   2. spectrogram (audio file is represented by a spectrogram)
   3. waveform (audio file is represented by a waveform)
The feature enabling the possibility to select a region in the rectangle was removed (useless for our case).

Example of usage:
<kbd>
[Watch the demo video](https://github.com/CrowdCurio/audio-annotator/blob/master/static/video/Demo_app_annotation.mp4)
</kbd>

### Feedback mechanisms
audio-annotator also provides mechanisms for providing real-time feedback to the user based on their annotations, but this feature was also removed for our usage.
   
### To Demo
1. In the audio-annotator/ directory run `python server.py`
2. Visit <http://localhost:8000/examples> in your browser to see the version with annotation. This demo also uses the spectrogram visualization.
3. As one can see on the demo video provided above, the annotator must listen the audio file one time before giving grade on Lickert's scale to each specific emotion. This feature was made in order to avoide annotator spamming wrong labels.

Note: In the examples, the submit annotations btn will output data to the followinf .json file: audio-annotator\results.jsonl (which is in the .gitignore).

### Feature added compared to initial repository
* **Audio transcription**
   * The transcription of the audio was made using whisperx. While the transcription is never 100% accurate, it still provides an okay subtitles and gives a good contexte and clues for the annotator, especially for medical purposes where the vocabulary can be difficult.
* **Audio file description**
   * The transcription might not be enough context in order to help the annotator. Therefore we added a description that can be adapted in order to give a general context. We also decided to show the name of the file that was playing, which in our case gives in, contexte information.
* **Lickert's scale and definition**
   * In order to better help the annotator, we provided a Lickert's scale as a label from grade 1 to 7 for each specific emotion (which were in our use case: Calme / assurance, Empathie / chaleur, Impatience / irritation and Froideur / détachement).
* **Comment box**
   * We also added a comment box right on top of the submit button, just in case if the annotators would like to report something odd with the audio file, or labelling the emotion.

### Interfacing with backends
The examples in the **examples/** do not depend on any specific backend. They make a call to json containing fake data in order to render the interface. Extra information for specific backends:

### Files
* [**examples/**](examples/)
   * [index.html](examples/index.html)  
      HTML file for the normal version of the interface, with 4 predefined emotions 

* [**static/css/**](static/css/)
   * [urban-ears.css](static/css/urban-ears.css)  
      Custom css for urbanears interface
   * [materialize.min.css](static/css/materialize.min.css)  
      Minified version of materlize css

* [**static/js/**](static/js/)
   * [colormap/](static/js/colormap/)
      * [gen_colormap.sh](static/js/colormap/gen_colormap.sh)  
         Shell script used to generate colormap.min.js. If gen_colormap.js is modified  
         run `source gen_colormap.sh` in the colormap directory to generate the new colormap.min.js
      * [gen_colormap.js](static/js/colormap/gen_colormap.js)  
         This file is used by gen_colormap.sh to generate colormap.min.js  
         It that requires colormap node module and adds it as a global variable  
         This file also defines the magma colour scheme
      * [colormap.min.js](static/js/colormap/colormap.min.js)  
         Generated JS file
   * [lib/](static/js/lib/)
      * Non modified minified external JS libraries used by the  urbanears interface
   * [src/](static/js/src/)
      * [annotation_stages.js](static/js/src/annotation_stages.js)  
         Defines: StageOneView (view when no region is selected), StageTwoView (online mode creation view), StageThreeView (view when region is selected, 
         it displays the tags to annotate the region), AnnotationStages (controller of the annotation work flow)
      * [components.js](static/js/src/components.js)  
         Defines: Util (helper functions for creating timestamp elements), PlayBar (play events, play button and progress time stamp), 
         WorkflowBtns (submit button and exit button)
      * [hidden_image.js](static/js/src/hidden_image.js)  
         Defines: HiddenImg (Creates elements to hide an image behind a canvas, and reveal random parts of the image)
      * [main.js](static/js/src/main.js)  
         Defines: UrbanEars (Creates and and updates all parts of the interface when a new task is loaded. Also submits task data) 
      * [message.js](static/js/src/message.js)  
         Defines: Message (helper functions that alert the user of different messages using Materlize toast)
      * [wavesurfer.drawer.extended.js](static/js/src/wavesurfer.drawer.extended.js)  
         Using the logic from the wavesurfer spectrogram plugin to override the wavesurfer drawer logic in order to have waveform visiualizations as well as spectrogram and inivisble visiualizations
      * [wavesurfer.labels.js](static/js/src/wavesurfer.labels.js)  
         Defines: WaveSurfer.Labels (creates container element for lables and controls the positioning of the labels), WaveSurfer.Label (individual label elements)
      * [wavesurfer.regions.js](static/js/src/wavesurfer.regions.js)  
         Modified version of wavesurfer regions plugin           
 (https://github.com/katspaugh/wavesurfer.js/blob/master/plugin/wavesurfer.regions.js)

* [**static/json/**](static/json/)
   * [Description_test.json](static/json/Description_test.json)  
      A description for the video from which the audio file was extracted from, to give context to the annotator.
   * [sample_data.json](static/json/sample_data.json)  
      Sample data for normal urban ears example      

