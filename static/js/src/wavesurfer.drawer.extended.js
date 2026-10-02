/*! wavesurfer.js 1.1.1 (Mon, 04 Apr 2016 09:49:47 GMT)
* https://github.com/katspaugh/wavesurfer.js
* @license CC-BY-3.0 */

'use strict';

/**
 * Purpose: 
 *   Add methods getFrequencyRGB, getFrequencies, resample, drawSpectrogram 
 *   to WaveSurfer.Drawer.Canvas. These methods are modified versions from the the 
 *   spectrogram plugin (https://github.com/katspaugh/wavesurfer.js/blob/master/plugin/wavesurfer.spectrogram.js)
 *   to allow the wavesurfer drawer to draw a spectrogram representation when this.params.visualization is 
 *   set to "spectrogram"
 * Dependencies:
 *   WaveSurfer (lib/wavesurfer.min.js & lib/wavesurfer.spectrogram.min.js)
 */
WaveSurfer.util.extend(WaveSurfer.Drawer.Canvas, {

    // Takes in integer 0-255 and maps it to rgb string
    getFrequencyRGB: function(colorValue) {
        if (this.params.colorMap) {
            // If the wavesurfer has a specified colour map
            var rgb = this.params.colorMap[colorValue];
            return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
        } else {
            // If not just use gray scale
            return 'rgb(' + colorValue + ',' + colorValue + ',' + colorValue + ')';
        }
        
    },

    getFrequencies: function(buffer) {
        var fftSamples = this.params.fftSamples || 512;
        var channelOne = Array.prototype.slice.call(buffer.getChannelData(0));
        var bufferLength = buffer.length;
        var sampleRate = buffer.sampleRate;
        var frequencies = [];

        if (! buffer) {
            this.fireEvent('error', 'Web Audio buffer is not available');
            return;
        }

        var noverlap = this.params.noverlap;
        if (! noverlap) {
            var uniqueSamplesPerPx = buffer.length / this.width;
            noverlap = Math.max(0, Math.round(fftSamples - uniqueSamplesPerPx));
        }

        var fft = new WaveSurfer.FFT(fftSamples, sampleRate);

        var maxSlicesCount = Math.floor(bufferLength/ (fftSamples - noverlap));

        var currentOffset = 0;

        var minFreq = 100;   
        var maxFreq = 17000//12800;  
        var minBin = Math.floor(minFreq * fftSamples / sampleRate);
        var maxBin = Math.ceil(maxFreq * fftSamples / sampleRate);

        while (currentOffset + fftSamples < channelOne.length) {
            var segment = channelOne.slice(currentOffset, currentOffset + fftSamples);
            var spectrum = fft.calculateSpectrum(segment);
            var length = fftSamples / 2 + 1;
            var array = new Uint8Array(length);
            for (var j = 0; j < length; j++) {
                array[j] = Math.max(-255, Math.log10(spectrum[j])*45);
            }
            frequencies.push(array.slice(minBin, maxBin)); //frequencies.push(array);
            currentOffset += (fftSamples - noverlap);
        }
        
        return frequencies;
    },

    // getFrequencies: function(buffer) {
    // var fftSamples = this.params.fftSamples || 512;
    // var channelOne = Array.prototype.slice.call(buffer.getChannelData(0));
    // var bufferLength = buffer.length;
    // var sampleRate = buffer.sampleRate;

    // var noverlap = this.params.noverlap;
    // if (!noverlap) {
    //     var uniqueSamplesPerPx = buffer.length / this.width;
    //     noverlap = Math.max(0, Math.round(fftSamples - uniqueSamplesPerPx));
    // }

    // var fft = new WaveSurfer.FFT(fftSamples, sampleRate);
    // var currentOffset = 0;
    // var allFrames = [];

    // while (currentOffset + fftSamples < channelOne.length) {
    //     var segment = channelOne.slice(currentOffset, currentOffset + fftSamples);
    //     var spectrum = fft.calculateSpectrum(segment);
    //     var length = fftSamples / 2 + 1;
    //     var array = new Uint8Array(length);
    //     for (var j = 0; j < length; j++) {
    //         array[j] = Math.max(-255, Math.log10(spectrum[j]) * 45);
    //     }
    //     allFrames.push(array);
    //     currentOffset += (fftSamples - noverlap);
    // }

    // // énergie totale par bin, sur tous les frames
    // var nBins = allFrames[0].length;
    // var energyPerBin = new Float64Array(nBins);
    // for (var f = 0; f < allFrames.length; f++) {
    //     for (var b = 0; b < nBins; b++) {
    //         energyPerBin[b] += allFrames[f][b];
    //     }
    // }

    // // trouve le bin le plus haut qui contient encore une part significative de l'énergie
    // var totalEnergy = energyPerBin.reduce(function(a, b) { return a + b; }, 0);
    // var cumulative = 0;
    // var cutoffBin = nBins - 1;
    // var threshold = 0.999; // garde 99.5% de l'énergie totale
    // for (var b = 0; b < nBins; b++) {
    //     cumulative += energyPerBin[b];
    //     if (cumulative / totalEnergy >= threshold) {
    //         cutoffBin = b;
    //         break;
    //     }
    // }

    // var minBin = Math.floor(100 * fftSamples / sampleRate); // ta borne basse fixe, ex 100 Hz
    // var maxBin = Math.max(cutoffBin, minBin + 1);

    // return allFrames.map(function(array) {
    //     return array.slice(minBin, maxBin);
    // });
    // },

    resample: function(oldMatrix) {
        var columnsNumber = this.width;
        var newMatrix = [];

        var oldPiece = 1 / oldMatrix.length;
        var newPiece = 1 / columnsNumber;

        for (var i = 0; i < columnsNumber; i++) {
            var column = new Array(oldMatrix[0].length);

            for (var j = 0; j < oldMatrix.length; j++) {
                var oldStart = j * oldPiece;
                var oldEnd = oldStart + oldPiece;
                var newStart = i * newPiece;
                var newEnd = newStart + newPiece;

                var overlap = (oldEnd <= newStart || newEnd <= oldStart) ?
                                0 :
                                Math.min(Math.max(oldEnd, newStart), Math.max(newEnd, oldStart)) -
                                Math.max(Math.min(oldEnd, newStart), Math.min(newEnd, oldStart));

                if (overlap > 0) {
                    for (var k = 0; k < oldMatrix[0].length; k++) {
                        if (column[k] == null) {
                            column[k] = 0;
                        }
                        column[k] += (overlap / newPiece) * oldMatrix[j][k];
                    }
                }
            }

            var intColumn = new Uint8Array(oldMatrix[0].length);

            for (var k = 0; k < oldMatrix[0].length; k++) {
                intColumn[k] = column[k];
            }

            newMatrix.push(intColumn);
        }

        return newMatrix;
    },

    // drawSpectrogram: function (buffer) {
    //     var pixelRatio = this.params.pixelRatio;
    //     var length = buffer.duration;
    //     var height = (this.params.fftSamples / 2) * pixelRatio;
    //     var frequenciesData = this.getFrequencies(buffer);

    //     var pixels = this.resample(frequenciesData);

    //     var heightFactor = pixelRatio;

    //     for (var i = 0; i < pixels.length; i++) {
    //         for (var j = 0; j < pixels[i].length; j++) {
    //             this.waveCc.fillStyle = this.getFrequencyRGB(pixels[i][j]);
    //             this.waveCc.fillRect(i, height - j * heightFactor, 1, heightFactor);
    //         }
    //     }
    // }


    drawSpectrogram: function (buffer) {
    var pixelRatio = this.params.pixelRatio;
    var length = buffer.duration;
    //var height = (this.params.fftSamples / 2) * pixelRatio;
    //var pixels = this.resample(frequenciesData);
    var frequenciesData = this.getFrequencies(buffer);
    var pixels = this.resample(frequenciesData);

    var height = pixels[0].length * pixelRatio;
    

    // Bornes calculées sur les percentiles réels, comme côté Python
    var allValues = [];
    for (var i = 0; i < pixels.length; i++) {
        for (var j = 0; j < pixels[i].length; j++) {
            allValues.push(pixels[i][j]);
        }
    }
    allValues.sort(function (a, b) { return a - b; });
    var percentile = function (p) {
        var idx = Math.floor((p / 100) * (allValues.length - 1));
        return allValues[idx];
    };
    var vmin = percentile(0);
    var vmax = percentile(98);
    var scale = 255 / Math.max(1, vmax - vmin);

    var heightFactor = pixelRatio;

    for (var i = 0; i < pixels.length; i++) {
        for (var j = 0; j < pixels[i].length; j++) {
            var v = Math.round((pixels[i][j] - vmin) * scale);
            v = Math.max(0, Math.min(255, v));
            this.waveCc.fillStyle = this.getFrequencyRGB(v);
            this.waveCc.fillRect(i, height - j * heightFactor, 1, heightFactor);
        }
    }
    }
});

/** 
 * Override the method WaveSurfer.drawBuffer to pass in the this.backend.buffer to
 * WaveSurfer.Drawer.drawPeaks since the buffer is needed to draw the spectrogram
 */
WaveSurfer.util.extend(WaveSurfer, {
    drawBuffer: function () {
        var nominalWidth = Math.round(
            this.getDuration() * this.params.minPxPerSec * this.params.pixelRatio
        );
        var parentWidth = this.drawer.getWidth();
        var width = nominalWidth;

        // Fill container
        if (this.params.fillParent && (!this.params.scrollParent || nominalWidth < parentWidth)) {
            width = parentWidth;
        }

        var peaks = this.backend.getPeaks(width);
        this.drawer.drawPeaks(peaks, width, this.backend.buffer);
        this.fireEvent('redraw', peaks, width);
    },
});

/** 
 * Override the methods WaveSurfer.Drawer.drawPeaks to support invisible and 
 * spectrogram representations
 */
WaveSurfer.util.extend(WaveSurfer.Drawer, {
    drawPeaks: function (peaks, length, buffer) {
        this.resetScroll();
        this.setWidth(length);
        var visualization = this.params.visualization;
        if (visualization === 'invisible') {
            //draw nothing
        } else if (visualization === 'spectrogram' && buffer) { // spectrogram, waveform
            this.drawSpectrogram(buffer);
        } else {
            this.params.barWidth ?
                this.drawBars(peaks) :
                this.drawWave(peaks);
        }
    }
});
