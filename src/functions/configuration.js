'use strict';

/**
This function is to emulate a config file for now
*/
export default function configuration() {
    if (this.settings === undefined) {
        this.settings = {
            compositionYouTubeNameExtension: ' YouTube',
            compositionTemplates: {
                'Lower Third': {
                    youtubeAlternative: true,
                    isSizeAlternative: true,
                    sizeAlternative: 'Full Screen'
                },
                'Full Screen': {
                    youtubeAlternative: true,
                    isSizeAlternative: true
                },
                'Full Screen YouTube': {
                    youtubeAlternative: false,
                    isSizeAlternative: false
                },
                'Scripture': {
                    youtubeAlternative: false,
                    isSizeAlternative: false
                },
                'Two Columns': {
                    youtubeAlternative: true,
                    isSizeAlternative: false
                }
            },
            mainCompositionsToBuild: {
                folderName: 'Sermon  - DELETE NEXT SCRIPT START',
                compositionsConfig: [{
                    name: 'English Service',
                    columnsToSwap: {
                        'German': 2,
                        'English': 1
                    },
                    audioSettings: {
                        'Left Level': 100,
                        'Right Level': 100,
                        'Left Pan': -100,
                        'Right Pan': 100
                    }
                }, {
                    name: 'German YouTube',
                    columnsToSwap: {
                        'German': 1
                    },
                    audioSettings: {
                        'Left Level': 0,
                        'Right Level': 100,
                        'Left Pan': 0,
                        'Right Pan': 0
                    }
                }],
                dateFormat: 'dd.mm.yyyy'
            },
            minimumSermonDurationInMin: 10,
            preferredSermonFormat: 'PRPROJ',
            parentFolderFootageExtensions: " Footage [Script Results]",
            requiredFieldsInCSV: ['startTime', 'endTime', 'composition'],
            standardCSVDelimiter: "\t",
            maskLayerNamePrefix: 'Mask',
            lineLayerNamePrefix: 'Line',
            fillInDelimiter: '[]',
            delimiterForNewLines: '{n}',
            maximumFontSizeChange: -0.15,
            animationProtectionTime: 2,
            tolerancePxForMaskPositioning: 4,
            preComposedMaskLayerExtension: '-composed-',
            columnNameToProcessForSplitting: 'Text',
            numberOfWordsBeforeSplitting: 80,
            seperatorForSplitting: '...',
        };
        var replaceWithYoutube = ['Full Screen', 'Two Columns'];
        for (var i = 0, l = replaceWithYoutube.length; i < l; i++) {
            var name = replaceWithYoutube[i];
            this.settings.compositionTemplates[name].sizeAlternative = name + this.settings.compositionYouTubeNameExtension;
        }
    }
    return this.settings;
}
