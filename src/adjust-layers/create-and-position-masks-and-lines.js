// TODO: If a fill in spreads over more than one line, the first and the last line works fine but the lines in between appear in the last line +bug id:99 gh:43

{
    try {
        importScript('errors/runtime-error');
        importScript('adjust-layers/adjust-pre-composed-comp-size');

    } catch (e) {
        throw new sbVideoScript.RuntimeError({
            func: "importScript's for createAndPositionMasksAndLines",
            title: 'Error loading neccesary functions',
            message: e.message
        })
    }

    sbVideoScript.createAndPositionMasksAndLines = function (maskAddr, mask, line, base, parentFolder) {
        try {
            var tolerancePx = sbVideoScript.settings.tolerancePxForMaskPositioning;
            var contComp = mask.containingComp;
            var preComposePrefix = contComp.name.substring(0,7) + sbVideoScript.settings.preComposedMaskLayerExtension;
            var compLayers = contComp.layers;
            var masksForPreCompose = [];
            var parentLayer = mask.parent;

            // if I need more than one fill in make the mask layer visible
            // we will later pre-compose all mask layers and
            // we will than make the pre-composition invisible again
            if (maskAddr.length > 1) {
                mask.enabled = true;
            }
            // iterate through all mask addresses from top to down
            for (var i = maskAddr.length - 1; i >= 0; i--) {
                var currMask = {};
                if (i === 0) {
                    // if I only need one fill in nothing needs to be created
                    currMask = mask;
                } else {
                    // if I need more than one fill in
                    // duplicate the maskLayer
                    // duplicate the lineLayer and set the new maskLayer as parent
                    currMask = mask.duplicate();
                    line.duplicate().parent = currMask;
                }
                var adr = maskAddr[i];

                // save the mask for later pre composing
                masksForPreCompose.push(currMask);

                // position the mask and size it
                var maskPropPos = currMask.property("Position");
                var posMask = maskPropPos.value;
                var moveX = adr.startX - base.x - tolerancePx;
                var moveY = adr.y - base.y;
                var width = adr.endX - adr.startX + tolerancePx * 2;
                posMask[0] += moveX;
                posMask[1] += moveY;
                maskPropPos.setValue(posMask);

                var maskPropScale = currMask.property("Scale");
                var orgMaskWidth = currMask.sourceRectAtTime(sbVideoScript.settings.animationProtectionTime, true).width;
                var newScale = maskPropScale.value;
                newScale[0] = width / orgMaskWidth * newScale[0];
                maskPropScale.setValue(newScale);
            }

            // put all masks into a precomp
            if (maskAddr.length > 1) {
                var items = [];
                for (var t = 0, ml = masksForPreCompose.length; t < ml; t++) {
                    items.push(masksForPreCompose[t].index);
                }
                var newCompName = preComposePrefix + mask.name;
                var newComp = compLayers.precompose(items, newCompName);
                // var compLayers = app.project.item(findItemIndexByName(contCompName));
                // newComp.parentFolder = parentFolder;
                var precomposedLayer = compLayers.byName(newCompName);
                precomposedLayer.enabled = false;

                // set the parent of the layer to the text
                precomposedLayer.parent = parentLayer;

                // adjust the size of the new comp
                sbVideoScript.adjustPreComposedCompSize(newComp, precomposedLayer);
            }

        } catch (e) {
            throw new sbVideoScript.RuntimeError({
                func: 'createAndPositionMasksAndLines',
                title: "Error while positioning masks and lines",
                message: e.message
            })
        }
    }
}
