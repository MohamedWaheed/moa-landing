(function(){
    var script = {
 "scripts": {
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; } if(audio.get('state') == 'playing') audio.pause(); },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext); }; playNext(); },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "shareTwitter": function(url){  window.open('https://twitter.com/intent/tweet?source=webclient&url=' + url, '_blank'); },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "existsKey": function(key){  return key in window; },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "unregisterKey": function(key){  delete window[key]; },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')]; } return audio; },
  "playGlobalAudio": function(audio, endCallback){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = audio; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "registerKey": function(key, value){  window[key] = value; },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "setOverlayBehaviour": function(overlay, media, action){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 2000); }; if(window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "getKey": function(key){  return window[key]; },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; if(audio){ delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; var mediaDispatcherByParam = mediaDispatcher != undefined; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = mediaDispatcher ? this.getPlayListWithMedia(mediaDispatcher, true) : undefined; if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } if(player != itemDispatcher.get('player') || !mediaDispatcherByParam){ item.bind('begin', onBeginFunction, self); } this.executeFunctionWhenChange(playList, index, disposeCallback); },
  "getPlayListWithMedia": function(media, onlySelected){  var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) return playList; } return undefined; },
  "keepComponentVisibility": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')]; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } return this.playGlobalAudio(audio, endCallback); },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "shareWhatsapp": function(url){  window.open('https://api.whatsapp.com/send/?text=' + encodeURIComponent(url), '_blank'); },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios)); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } },
  "shareFacebook": function(url){  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank'); }
 },
 "horizontalAlign": "left",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.MainViewer",
  "this.Image_4BCDC2D5_5BED_E778_41D2_A2D965025AB3",
  "this.ThumbnailGrid_4B7ED747_5C1E_6D59_41D3_11A1BE8A8E17"
 ],
 "id": "rootPlayer",
 "defaultVRPointer": "laser",
 "paddingBottom": 0,
 "shadow": false,
 "start": "this.init(); this.syncPlaylists([this.ThumbnailGrid_4B7ED747_5C1E_6D59_41D3_11A1BE8A8E17_playlist,this.mainPlayList])",
 "width": "100%",
 "scrollBarMargin": 2,
 "downloadEnabled": true,
 "gap": 10,
 "scrollBarWidth": 10,
 "overflow": "visible",
 "paddingRight": 0,
 "borderSize": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "height": "100%",
 "definitions": [{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "camera_D06EAECA_C06A_B84D_41C8_C9250D59DC4B",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 102.12,
  "pitch": 0
 }
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "camera_D05AEEF2_C06A_B85D_41E7_FE9A1AC54C20",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -126.87,
  "pitch": 0
 }
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "camera_D0362F18_C06A_B9CD_41E7_9E4AA6298262",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -137.67,
  "pitch": 0
 }
},
{
 "mouseControlMode": "drag_acceleration",
 "gyroscopeVerticalDraggingEnabled": true,
 "displayPlaybackBar": true,
 "class": "PanoramaPlayer",
 "id": "MainViewerPanoramaPlayer",
 "viewerArea": "this.MainViewer",
 "touchControlMode": "drag_rotation"
},
{
 "class": "FadeOutEffect",
 "easing": "linear",
 "id": "effect_482F53D0_5C2A_6578_41C2_D96A19B11DA9",
 "duration": 2000
},
{
 "vfov": 180,
 "label": "Dining",
 "id": "panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923",
 "hfovMax": 130,
 "pitch": 0,
 "thumbnailUrl": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_t.jpg",
 "class": "Panorama",
 "frames": [
  {
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0/b/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0/b/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0/f/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0/f/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0/u/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0/u/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0/r/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0/r/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_t.jpg",
   "class": "CubicPanoramaFrame",
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0/d/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0/d/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0/l/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0/l/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "overlays": [
  "this.overlay_7D057687_5C27_AF22_41CC_1A8D1C7494B5",
  "this.overlay_7D054687_5C27_AF22_41C4_3DD59371B9DE",
  "this.overlay_7D055687_5C27_AF22_41D6_78060C48E669"
 ],
 "hfovMin": "150%",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "backwardYaw": 26.63,
   "panorama": "this.panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB",
   "yaw": 42.33,
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "backwardYaw": 28.89,
   "panorama": "this.panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0",
   "yaw": 169.32,
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "backwardYaw": 28.89,
   "panorama": "this.panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0",
   "yaw": -177.36,
   "distance": 1
  }
 ],
 "hfov": 360,
 "partial": false
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "camera_CF83BEA8_C06A_B8CD_41DD_FF76B969846B",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 70.97,
  "pitch": 0
 }
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 0,
  "pitch": 0
 }
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "camera_D0784ED7_C06A_B843_41E6_9D4607204E6B",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -10.68,
  "pitch": 0
 }
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 0,
  "pitch": 0
 }
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "camera_D024BF0B_C06A_B9C3_41E7_6E232E171353",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -177.24,
  "pitch": 0
 }
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "camera_D02BDEFE_C06A_B845_41DB_CA3E93006245",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -177.24,
  "pitch": 0
 }
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "camera_D0E26F3F_C06A_B9C3_41B4_B9DCE4D32F75",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -151.11,
  "pitch": 0
 }
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 0,
  "pitch": 0
 }
},
{
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "backwardYaw": 2.76,
   "panorama": "this.panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE",
   "yaw": -78.61,
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "backwardYaw": 2.76,
   "panorama": "this.panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE",
   "yaw": -141.12,
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "backwardYaw": 42.33,
   "panorama": "this.panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923",
   "yaw": 26.63,
   "distance": 1
  }
 ],
 "vfov": 180,
 "hfov": 360,
 "label": "Pergola",
 "id": "panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB",
 "partial": false,
 "hfovMax": 130,
 "pitch": 0,
 "thumbnailUrl": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_t.jpg",
 "class": "Panorama",
 "frames": [
  {
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0/b/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0/b/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0/f/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0/f/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0/u/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0/u/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0/r/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0/r/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_t.jpg",
   "class": "CubicPanoramaFrame",
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0/d/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0/d/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0/l/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0/l/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "overlays": [
  "this.overlay_799EC395_5C3E_A48D_41D5_AE5F0E8B2710",
  "this.overlay_68AC9D13_7B7D_8436_41A2_239CCDF31445",
  "this.overlay_6EF163A5_7B7A_9C12_41D6_E2A133D27DD7"
 ]
},
{
 "class": "PlayList",
 "items": [
  {
   "begin": "this.setEndToItemIndex(this.mainPlayList, 0, 1)",
   "media": "this.panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60",
   "class": "PanoramaPlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_camera"
  },
  {
   "begin": "this.setEndToItemIndex(this.mainPlayList, 1, 2)",
   "media": "this.panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0",
   "class": "PanoramaPlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_camera"
  },
  {
   "begin": "this.setEndToItemIndex(this.mainPlayList, 2, 3)",
   "media": "this.panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923",
   "class": "PanoramaPlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_camera"
  },
  {
   "begin": "this.setEndToItemIndex(this.mainPlayList, 3, 4)",
   "media": "this.panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE",
   "class": "PanoramaPlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_camera"
  },
  {
   "begin": "this.setEndToItemIndex(this.mainPlayList, 4, 0)",
   "media": "this.panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB",
   "end": "this.trigger('tourEnded')",
   "class": "PanoramaPlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_camera"
  }
 ],
 "id": "mainPlayList"
},
{
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "backwardYaw": -109.03,
   "panorama": "this.panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0",
   "yaw": -113.8,
   "distance": 1
  }
 ],
 "vfov": 180,
 "hfov": 360,
 "label": "Lobby",
 "id": "panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60",
 "partial": false,
 "hfovMax": 130,
 "pitch": 0,
 "thumbnailUrl": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_t.jpg",
 "class": "Panorama",
 "frames": [
  {
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0/b/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0/b/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0/f/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0/f/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0/u/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0/u/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0/r/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0/r/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_t.jpg",
   "class": "CubicPanoramaFrame",
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0/d/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0/d/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0/l/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0/l/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "overlays": [
  "this.overlay_775F1C99_7B76_8432_41D8_13DEB8CB26CC"
 ]
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "camera_CF9D0EBB_C06A_B8C3_41D1_20A91509A5D8",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 66.2,
  "pitch": 0
 }
},
{
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "backwardYaw": -113.8,
   "panorama": "this.panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60",
   "yaw": -109.03,
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "backwardYaw": -77.88,
   "panorama": "this.panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE",
   "yaw": 53.13,
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "backwardYaw": 169.32,
   "panorama": "this.panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923",
   "yaw": 28.89,
   "distance": 1
  }
 ],
 "vfov": 180,
 "hfov": 360,
 "label": "Reception",
 "id": "panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0",
 "partial": false,
 "hfovMax": 130,
 "pitch": 0,
 "thumbnailUrl": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_t.jpg",
 "class": "Panorama",
 "frames": [
  {
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0/b/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0/b/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0/f/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0/f/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0/u/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0/u/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0/r/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0/r/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_t.jpg",
   "class": "CubicPanoramaFrame",
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0/d/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0/d/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0/l/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0/l/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "overlays": [
  "this.overlay_47C22CAF_5C3B_E329_41BC_61FC7BA1661D",
  "this.overlay_47C3DCAF_5C3B_E329_41A8_4D0DB3952DE3",
  "this.overlay_466A9005_5C26_62D9_41BA_980158A52DBB"
 ]
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "camera_D007EF25_C06A_B9C7_41DD_61248C04C353",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -153.37,
  "pitch": 0
 }
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "camera_D0496EE5_C06A_B847_41D8_6A969A6154EE",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 101.39,
  "pitch": 0
 }
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 0,
  "pitch": 0
 }
},
{
 "class": "PlayList",
 "items": [
  {
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4B7ED747_5C1E_6D59_41D3_11A1BE8A8E17_playlist, 0, 1)",
   "media": "this.panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60",
   "class": "PanoramaPlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_camera"
  },
  {
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4B7ED747_5C1E_6D59_41D3_11A1BE8A8E17_playlist, 1, 2)",
   "media": "this.panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0",
   "class": "PanoramaPlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_camera"
  },
  {
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4B7ED747_5C1E_6D59_41D3_11A1BE8A8E17_playlist, 2, 3)",
   "media": "this.panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923",
   "class": "PanoramaPlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_camera"
  },
  {
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4B7ED747_5C1E_6D59_41D3_11A1BE8A8E17_playlist, 3, 4)",
   "media": "this.panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE",
   "class": "PanoramaPlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_camera"
  },
  {
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4B7ED747_5C1E_6D59_41D3_11A1BE8A8E17_playlist, 4, 0)",
   "media": "this.panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB",
   "class": "PanoramaPlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_camera"
  }
 ],
 "id": "ThumbnailGrid_4B7ED747_5C1E_6D59_41D3_11A1BE8A8E17_playlist"
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 0,
  "pitch": 0
 }
},
{
 "automaticRotationSpeed": 0,
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "camera_D010BF32_C06A_B9DD_41E1_2E12DBC676C1",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -151.11,
  "pitch": 0
 }
},
{
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "backwardYaw": -78.61,
   "panorama": "this.panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB",
   "yaw": 2.76,
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "backwardYaw": 53.13,
   "panorama": "this.panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0",
   "yaw": -77.88,
   "distance": 1
  }
 ],
 "vfov": 180,
 "hfov": 360,
 "label": "Garden",
 "id": "panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE",
 "partial": false,
 "hfovMax": 130,
 "pitch": 0,
 "thumbnailUrl": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_t.jpg",
 "class": "Panorama",
 "frames": [
  {
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0/b/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0/b/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0/f/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0/f/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0/u/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0/u/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0/r/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0/r/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_t.jpg",
   "class": "CubicPanoramaFrame",
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0/d/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0/d/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0/l/0/{row}_{column}.jpg",
      "width": 1024,
      "tags": "ondemand",
      "colCount": 2,
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0/l/1/{row}_{column}.jpg",
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "overlays": [
  "this.overlay_46FE6088_5C2E_63D7_41BE_9CCE324D9603",
  "this.overlay_763D7995_5C3F_A48D_41D5_E54F33EEE878"
 ]
},
{
 "toolTipPaddingBottom": 4,
 "toolTipTextShadowBlurRadius": 3,
 "id": "MainViewer",
 "toolTipShadowColor": "#333333",
 "paddingBottom": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipFontWeight": "normal",
 "right": 3.05,
 "playbackBarHeight": 10,
 "playbackBarBackgroundColorDirection": "vertical",
 "playbackBarHeadWidth": 6,
 "width": "99.517%",
 "playbackBarRight": 0,
 "progressBarBorderSize": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "transitionDuration": 500,
 "playbackBarHeadShadowVerticalLength": 0,
 "progressBarBorderRadius": 0,
 "toolTipShadowOpacity": 1,
 "playbackBarBorderRadius": 0,
 "paddingLeft": 0,
 "toolTipFontFamily": "Arial",
 "height": "99.892%",
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBorderRadius": 0,
 "playbackBarHeadBorderColor": "#000000",
 "toolTipTextShadowOpacity": 0,
 "minHeight": 50,
 "progressLeft": 0,
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarBorderSize": 0,
 "propagateClick": false,
 "toolTipShadowVerticalLength": 0,
 "minWidth": 100,
 "toolTipFontColor": "#606060",
 "toolTipShadowHorizontalLength": 0,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "toolTipBackgroundColor": "#F6F6F6",
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "progressBarBackgroundColorDirection": "vertical",
 "progressBottom": 0,
 "vrPointerSelectionTime": 2000,
 "progressHeight": 10,
 "playbackBarHeadShadow": true,
 "playbackBarHeadShadowHorizontalLength": 0,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "toolTipPaddingRight": 6,
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "toolTipBorderSize": 1,
 "toolTipPaddingLeft": 6,
 "toolTipPaddingTop": 4,
 "vrPointerColor": "#FFFFFF",
 "toolTipDisplayTime": 600,
 "progressBarOpacity": 1,
 "top": 0,
 "paddingRight": 0,
 "borderSize": 0,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBorderSize": 0,
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "transitionMode": "blending",
 "progressBorderRadius": 0,
 "displayTooltipInTouchScreens": false,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarHeadHeight": 15,
 "class": "ViewerArea",
 "playbackBarHeadShadowBlurRadius": 3,
 "toolTipShadowBlurRadius": 3,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "progressBarBorderColor": "#000000",
 "toolTipBorderColor": "#767676",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "toolTipShadowSpread": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 5,
 "toolTipOpacity": 1,
 "data": {
  "name": "Main Viewer"
 },
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipFontSize": "1.11vmin",
 "toolTipTextShadowColor": "#000000",
 "progressBorderColor": "#000000",
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "paddingTop": 0
},
{
 "horizontalAlign": "center",
 "id": "Image_4BCDC2D5_5BED_E778_41D2_A2D965025AB3",
 "left": "0%",
 "paddingBottom": 0,
 "shadow": false,
 "width": "100%",
 "url": "skin/Image_4BCDC2D5_5BED_E778_41D2_A2D965025AB3.jpg",
 "maxWidth": 3000,
 "maxHeight": 3000,
 "backgroundOpacity": 0,
 "top": "0%",
 "paddingRight": 0,
 "borderSize": 0,
 "height": "100%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "class": "Image",
 "propagateClick": false,
 "click": "this.setComponentVisibility(this.Image_4BCDC2D5_5BED_E778_41D2_A2D965025AB3, false, 0, this.effect_482F53D0_5C2A_6578_41C2_D96A19B11DA9, 'hideEffect', false)",
 "minWidth": 1,
 "verticalAlign": "middle",
 "data": {
  "name": "Image4928"
 },
 "scaleMode": "fit_to_height",
 "paddingTop": 0
},
{
 "itemPaddingBottom": 3,
 "horizontalAlign": "center",
 "id": "ThumbnailGrid_4B7ED747_5C1E_6D59_41D3_11A1BE8A8E17",
 "left": "36.71%",
 "paddingBottom": 10,
 "paddingTop": 10,
 "itemMode": "normal",
 "width": "25.875%",
 "itemLabelHorizontalAlign": "center",
 "scrollBarMargin": 2,
 "itemOpacity": 1,
 "itemLabelPosition": "bottom",
 "maxWidth": 800,
 "itemLabelFontStyle": "normal",
 "itemVerticalAlign": "middle",
 "scrollBarWidth": 10,
 "itemLabelFontFamily": "Arial",
 "backgroundOpacity": 0,
 "itemThumbnailBorderRadius": 1,
 "itemBorderRadius": 0,
 "height": "6.919%",
 "paddingLeft": 20,
 "itemPaddingLeft": 3,
 "minHeight": 0,
 "playList": "this.ThumbnailGrid_4B7ED747_5C1E_6D59_41D3_11A1BE8A8E17_playlist",
 "propagateClick": false,
 "scrollBarOpacity": 0.59,
 "itemThumbnailOpacity": 1,
 "minWidth": 0,
 "verticalAlign": "top",
 "itemPaddingTop": 3,
 "scrollBarColor": "#FFFFFF",
 "itemBackgroundColor": [
  "#171717"
 ],
 "itemPaddingRight": 3,
 "scrollBarVisible": "rollOver",
 "itemBackgroundColorRatios": [
  0.04
 ],
 "itemLabelGap": 2,
 "itemBackgroundOpacity": 0,
 "shadow": false,
 "itemLabelTextDecoration": "none",
 "maxHeight": 600,
 "itemLabelFontWeight": "normal",
 "itemThumbnailHeight": 31,
 "paddingRight": 20,
 "itemThumbnailScaleMode": "fit_outside",
 "itemLabelFontSize": 14,
 "borderRadius": 5,
 "itemThumbnailShadow": false,
 "borderSize": 0,
 "selectedItemLabelFontWeight": "bold",
 "bottom": "0%",
 "itemLabelFontColor": "#FFFFFF",
 "itemThumbnailWidth": 50,
 "class": "ThumbnailList",
 "click": "this.mainPlayList.set('selectedIndex', 0)",
 "itemHorizontalAlign": "center",
 "itemBackgroundColorDirection": "vertical",
 "layout": "horizontal",
 "data": {
  "name": "ThumbnailList4860"
 },
 "gap": 0
},
{
 "useHandCursor": true,
 "enabledInCardboard": true,
 "data": {
  "label": "Polygon"
 },
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 42.33,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_1_HS_0_1_0_map.gif",
      "width": 84,
      "height": 200
     }
    ]
   },
   "pitch": -11.12,
   "hfov": 28.09
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_7D057687_5C27_AF22_41CC_1A8D1C7494B5",
 "rollOverDisplay": false,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB, this.camera_D007EF25_C06A_B9C7_41DD_61248C04C353); this.mainPlayList.set('selectedIndex', 4)",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "useHandCursor": true,
 "enabledInCardboard": true,
 "data": {
  "label": "Polygon"
 },
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 169.32,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0_HS_1_1_0_map.gif",
      "width": 93,
      "height": 186
     }
    ]
   },
   "pitch": -4.46,
   "hfov": 22.1
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_7D054687_5C27_AF22_41C4_3DD59371B9DE",
 "rollOverDisplay": false,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0, this.camera_D010BF32_C06A_B9DD_41E1_2E12DBC676C1); this.mainPlayList.set('selectedIndex', 1)",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "useHandCursor": true,
 "enabledInCardboard": true,
 "data": {
  "label": "Polygon"
 },
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -177.36,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923_0_HS_2_1_0_map.gif",
      "width": 25,
      "height": 182
     }
    ]
   },
   "pitch": -2.83,
   "hfov": 6.03
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_7D055687_5C27_AF22_41D6_78060C48E669",
 "rollOverDisplay": false,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0, this.camera_D0E26F3F_C06A_B9C3_41B4_B9DCE4D32F75); this.mainPlayList.set('selectedIndex', 1)",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "useHandCursor": true,
 "enabledInCardboard": true,
 "data": {
  "label": "Polygon"
 },
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 26.63,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_1_HS_0_1_0_map.gif",
      "width": 80,
      "height": 136
     }
    ]
   },
   "pitch": 1.82,
   "hfov": 19.22
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_799EC395_5C3E_A48D_41D5_AE5F0E8B2710",
 "rollOverDisplay": false,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923, this.camera_D0362F18_C06A_B9CD_41E7_9E4AA6298262); this.mainPlayList.set('selectedIndex', 2)",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "useHandCursor": true,
 "enabledInCardboard": true,
 "data": {
  "label": "Polygon"
 },
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -78.61,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0_HS_1_1_0_map.gif",
      "width": 200,
      "height": 147
     }
    ]
   },
   "pitch": 6.15,
   "hfov": 101.56
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_68AC9D13_7B7D_8436_41A2_239CCDF31445",
 "rollOverDisplay": false,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE, this.camera_D02BDEFE_C06A_B845_41DB_CA3E93006245); this.mainPlayList.set('selectedIndex', 3)",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "useHandCursor": true,
 "enabledInCardboard": true,
 "data": {
  "label": "Polygon"
 },
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -141.12,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB_0_HS_2_1_0_map.gif",
      "width": 87,
      "height": 200
     }
    ]
   },
   "pitch": 6.63,
   "hfov": 27.83
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_6EF163A5_7B7A_9C12_41D6_E2A133D27DD7",
 "rollOverDisplay": false,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE, this.camera_D024BF0B_C06A_B9C3_41E7_6E232E171353); this.mainPlayList.set('selectedIndex', 3)",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "useHandCursor": true,
 "enabledInCardboard": true,
 "data": {
  "label": "Polygon"
 },
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -113.8,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0_HS_0_1_0_map.gif",
      "width": 96,
      "height": 199
     }
    ]
   },
   "pitch": -0.89,
   "hfov": 68.7
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "yaw": -113.8,
   "hfov": 68.7,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60_0_HS_0_0.png",
      "width": 652,
      "height": 1349
     }
    ]
   },
   "pitch": -0.89,
   "roll": 0,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_775F1C99_7B76_8432_41D8_13DEB8CB26CC",
 "rollOverDisplay": false,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0, this.camera_CF83BEA8_C06A_B8CD_41DD_FF76B969846B); this.mainPlayList.set('selectedIndex', 1)",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "useHandCursor": true,
 "enabledInCardboard": true,
 "data": {
  "label": "Polygon"
 },
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -109.03,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0_HS_0_1_0_map.gif",
      "width": 127,
      "height": 200
     }
    ]
   },
   "pitch": 8.23,
   "hfov": 43.49
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_47C22CAF_5C3B_E329_41BC_61FC7BA1661D",
 "rollOverDisplay": false,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_775EAC98_7B76_8432_41B4_A4A77FB49C60, this.camera_CF9D0EBB_C06A_B8C3_41D1_20A91509A5D8); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "useHandCursor": true,
 "enabledInCardboard": true,
 "data": {
  "label": "Polygon"
 },
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 53.13,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0_HS_1_1_0_map.gif",
      "width": 55,
      "height": 167
     }
    ]
   },
   "pitch": 3.2,
   "hfov": 13.18
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "yaw": 53.13,
   "hfov": 13.18,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0_HS_1_0.png",
      "width": 110,
      "height": 334
     }
    ]
   },
   "pitch": 3.2,
   "roll": 0,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_47C3DCAF_5C3B_E329_41A8_4D0DB3952DE3",
 "rollOverDisplay": false,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE, this.camera_D06EAECA_C06A_B84D_41C8_C9250D59DC4B); this.mainPlayList.set('selectedIndex', 3)",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "useHandCursor": true,
 "enabledInCardboard": true,
 "data": {
  "label": "Polygon"
 },
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 28.89,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0_0_HS_2_1_0_map.gif",
      "width": 157,
      "height": 194
     }
    ]
   },
   "pitch": 6.06,
   "hfov": 36.48
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_466A9005_5C26_62D9_41BA_980158A52DBB",
 "rollOverDisplay": false,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_7D056687_5C27_AF22_41C0_C6CF3DD0D923, this.camera_D0784ED7_C06A_B843_41E6_9D4607204E6B); this.mainPlayList.set('selectedIndex', 2)",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "useHandCursor": true,
 "enabledInCardboard": true,
 "data": {
  "label": "Polygon"
 },
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -77.88,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0_HS_1_1_0_map.gif",
      "width": 66,
      "height": 140
     }
    ]
   },
   "pitch": 3.08,
   "hfov": 15.79
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "yaw": -77.88,
   "hfov": 15.79,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0_HS_1_0.png",
      "width": 132,
      "height": 281
     }
    ]
   },
   "pitch": 3.08,
   "roll": 0,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_46FE6088_5C2E_63D7_41BE_9CCE324D9603",
 "rollOverDisplay": false,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_47C23CAF_5C3B_E329_41AD_955F665F2BE0, this.camera_D05AEEF2_C06A_B85D_41E7_FE9A1AC54C20); this.mainPlayList.set('selectedIndex', 1)",
   "mapColor": "#FF0000"
  }
 ]
},
{
 "useHandCursor": true,
 "enabledInCardboard": true,
 "data": {
  "label": "Polygon"
 },
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 2.76,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "class": "ImageResourceLevel",
      "url": "media/panorama_50D30CB5_5BBE_449D_41AF_89BB3BF970DE_0_HS_2_1_0_map.gif",
      "width": 200,
      "height": 80
     }
    ]
   },
   "pitch": 5.68,
   "hfov": 82.32
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_763D7995_5C3F_A48D_41D5_E54F33EEE878",
 "rollOverDisplay": false,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_7B4B7E57_5C3A_9F8E_41C2_D9BF9A8BB4EB, this.camera_D0496EE5_C06A_B847_41D8_6A969A6154EE); this.mainPlayList.set('selectedIndex', 4)",
   "mapColor": "#FF0000"
  }
 ]
}],
 "minHeight": 20,
 "mobileMipmappingEnabled": false,
 "class": "Player",
 "propagateClick": false,
 "desktopMipmappingEnabled": false,
 "vrPolyfillScale": 0.5,
 "scrollBarOpacity": 0.5,
 "minWidth": 20,
 "verticalAlign": "top",
 "layout": "absolute",
 "scrollBarColor": "#000000",
 "contentOpaque": false,
 "data": {
  "name": "Player4857"
 },
 "backgroundPreloadEnabled": true,
 "mouseWheelEnabled": true,
 "paddingTop": 0
};

    
    function HistoryData(playList) {
        this.playList = playList;
        this.list = [];
        this.pointer = -1;
    }

    HistoryData.prototype.add = function(index){
        if(this.pointer < this.list.length && this.list[this.pointer] == index) {
            return;
        }
        ++this.pointer;
        this.list.splice(this.pointer, this.list.length - this.pointer, index);
    };

    HistoryData.prototype.back = function(){
        if(!this.canBack()) return;
        this.playList.set('selectedIndex', this.list[--this.pointer]);
    };

    HistoryData.prototype.forward = function(){
        if(!this.canForward()) return;
        this.playList.set('selectedIndex', this.list[++this.pointer]);
    };

    HistoryData.prototype.canBack = function(){
        return this.pointer > 0;
    };

    HistoryData.prototype.canForward = function(){
        return this.pointer >= 0 && this.pointer < this.list.length-1;
    };
    //

    if(script.data == undefined)
        script.data = {};
    script.data["history"] = {};    //playListID -> HistoryData

    TDV.PlayerAPI.defineScript(script);
})();
