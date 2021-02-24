/**
 * agora js
 * 
 * @package Sngine
 * @author Zamblek
 */

// initialize live global vars
var live_post_id;
var live_realtime_thread;
var live_realtime_process = false;
var live_streaming_process = false;


// keep track of streams
var localStreams = {
    uid: '',
    camera: {
        camId: '',
        micId: '',
        stream: {}
    }
};


// keep track of devices
var devices = {
    cameras: [],
    mics: []
}


// create agora client instance (mode:rtc|live - codec: vp8|h264)
var client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });


// set agora log level (DEBUG for dev | NONE for prod)
AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.NONE);


// leave live channel when stream unpublished
client.on("stream-unpublished", function(evt) {
    agora_leave_channel();
});


// [agora] join channel
function agora_join_channel() {
    /* set the role */
    client.setClientRole('host');
    /* join live channel */
    client.join(agora_token, agora_channel_name, agora_uid, function(uid) {
        agora_create_camera_stream(uid, {});
        localStreams.uid = uid;
    });
}


// [agora] leave channel
function agora_leave_channel() {
    /* leave live channel */
    client.leave(function() {}, function(err) {
        /* update live status */
        show_live_status();
        $('#js_live-status').html('<i class="fas fa-exclamation-circle mr5"></i>' + __['Ending live error'] + '(' + err +')').addClass("error");
    });
}


// [agora] create stream
function agora_create_camera_stream(uid, deviceIds) {
    var localStream = AgoraRTC.createStream({
        streamID: uid,
        audio: true,
        video: true,
        screen: false
    });
    localStream.setVideoProfile('720p_6');
    /* The user has granted access to the camera and mic */
    localStream.on("accessAllowed", function() {
        if(devices.cameras.length === 0 && devices.mics.length === 0) {
            agora_get_camera_devices();
            agora_get_mic_devices();
        }
    });
    /* init local stream */
    localStream.init(function() {
        localStream.play('js_live-video');
        /* publish local stream */
        client.publish(localStream);
        localStreams.camera.stream = localStream;
    });
}


// [agora] unpublish stream
function agora_unpublish_stream() {
    localStreams.camera.stream.stop();
    localStreams.camera.stream.close();
    client.unpublish(localStreams.camera.stream, function(err) {
        show_live_status();
        $('#js_live-status').html('<i class="fas fa-exclamation-circle mr5"></i>' + __['Ending live error'] + '(' + err +')').addClass("error");
    });
}


// [agora] change stream source
function agora_change_stream_source(deviceIndex, deviceType) {
    var deviceId;
    var existingStream = false;
    if(deviceType === "video") {
        deviceId = devices.cameras[deviceIndex].deviceId
    }
    if(deviceType === "audio") {
        deviceId = devices.mics[deviceIndex].deviceId;
    }
    /* update live status */
    show_live_status();
    $('#js_live-status').html(__['Switching stream sources'] + '<span class="spinner-grow spinner-grow-sm ml10"></span>');
    localStreams.camera.stream.switchDevice(deviceType, deviceId, function() {
        /* update live status */
        $('#js_live-status').html('<i class="fas fa-check mr5"></i>' + __['Successfully switched to new device']).addClass("success");
        hide_live_status();
        /* set the active device ids */
        if(deviceType === "audio") {
            localStreams.camera.micId = deviceId;
        } else if(deviceType === "video") {
            localStreams.camera.camId = deviceId;
        } else {
            /* update live status */
            show_live_status();
            $('#js_live-status').html('<i class="fas fa-exclamation-circle mr5"></i>' + __['Unable to determine device type']).addClass("error");
            hide_live_status();
        }
    }, function() {
        /* update live status */
        show_live_status();
        $('#js_live-status').html('<i class="fas fa-exclamation-circle mr5"></i>' + __['Failed to switch to new device']).addClass("error");
        hide_live_status();
    });
}


// [agora] get camera devices
function agora_get_camera_devices() {
    client.getCameras(function(cameras) {
        devices.cameras = cameras;
        cameras.forEach(function(camera, i) {
            var name = camera.label.split('(')[0];
            var optionId = 'camera_' + i;
            var deviceId = camera.deviceId;
            if(i === 0 && localStreams.camera.camId === '') {
                localStreams.camera.camId = deviceId;
            }
            /* update camera-list */
            $('#camera-list').append('<div class="dropdown-item pointer js_live-change-camera" id="' + optionId + '">' + name + '</div>');
        });
    });
}


// [agora] get mic devices
function agora_get_mic_devices() {
    client.getRecordingDevices(function(mics) {
        devices.mics = mics;
        mics.forEach(function(mic, i) {
            var name = mic.label.split('(')[0];
            var optionId = 'mic_' + i;
            var deviceId = mic.deviceId;
            if(i === 0 && localStreams.camera.micId === '') {
                localStreams.camera.micId = deviceId;
            }
            if(name.split('Default - ')[1] != undefined) {
                name = '[Default Device]';
            }
            /* update mic-list */
            $('#mic-list').append('<div class="dropdown-item pointer js_live-change-mic" id="' + optionId + '">' + name + '</div>');
        });
    });
}


// end live
function end_live() {
    if(!live_streaming_process) {
        return;
    }
    /* update live streaming process */
    live_streaming_process = false;
    /* unpublish live stream & leave the live channel */
    agora_unpublish_stream();
    /* update live status */
    show_live_status();
    $('#js_live-status').html('<i class="fas fa-info-circle mr5"></i>' + __['You are offline now']).addClass("info");
    hide_live_status();
    /* clear live real-time thread */
    clearInterval(live_realtime_thread);
    /* reset live realtime process */
    live_realtime_process = false;
    /* handle the live buttons */
    $('#js_live-start').show();
    $('#js_live-end').hide();
    /* handle stream buttons */
    $('#js_live-stream-buttons').hide();
    /* handle live counter */
    $('#js_live-counter-status').html(__['Offline']).addClass("offline");
    $('#js_live-counter-number').html(0);
    /* handle live recording */
    $('#js_live-recording').hide();
    /* update the server side */
    $.post(api['live/reaction'], {'do': 'end', 'post_id': live_post_id}, 'json');
    /* update live_post_id */
    live_post_id = undefined;
    /* remove live comments */
    $('#live-comments').find('ul.js_scroller').html('');
    /* handle button status */
    button_status($('#js_live-end'), "reset");
}


// show live status
function show_live_status() {
    $('#js_live-status').removeAttr("style").removeClass("success error info").show();
}


// hide live status
function hide_live_status() {
    setTimeout(function() {
        $('#js_live-status').animate({bottom: '0px', opacity: '0'});
    }, '2500');
}


// capture video thumbnail
function capture_video_thumbnail() {
    /* get video */
    var video = $("#js_live-video")[0];
    /* set canvas */
    var canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    /* return */
    return canvas.toDataURL('image/png');
}


$(function() {

	// get user camera and mic permission
	if(!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        /* update live status */
	    $('#js_live-status').html('<i class="fas fa-exclamation-circle mr5"></i>' + __['Sorry, WebRTC is not available in your browser']).addClass("error");
	} else {
		navigator.mediaDevices.getUserMedia({audio: true, video: true})
		.then((stream) => {
            /* update live status */
            $('#js_live-status').html('<i class="fas fa-info-circle mr5"></i>' + __['You are ready to Go Live now']).addClass("info");
            /* show live video  */
            $("#js_live-video")[0].srcObject = stream;
            $("#js_live-video").show();
            /* handle the live buttons */
            $('#js_live-start').show();
		})
		.catch(err => {
            /* update live status */
			$('#js_live-status').html('<i class="fas fa-exclamation-circle mr5"></i>' + __['Getting permissions failed'] + ' (' + err + ')').addClass("error");
		});
	}


	// start live stream
    $('body').on('click', '#js_live-start', function () {
        /* handle button status */
        button_status($('#js_live-start'), "loading");
        /* update live status */
        show_live_status();
        $('#js_live-status').html(__['Going Live'] + '<span class="spinner-grow spinner-grow-sm ml10"></span>');
    	client.init(agora_app_id, function() {
		    /* join live channel */
            agora_join_channel();
            /* take video thumbnail */
            var video_thumbnail = capture_video_thumbnail();
            /* update the server side */
            $.post(api['live/reaction'], {'do': 'start', 'agora_uid': agora_uid, 'agora_token': agora_token, 'agora_channel_name': agora_channel_name, 'video_thumbnail': video_thumbnail}, function(response) {
                /* update live_post_id */
                live_post_id = response.post_id;
                /* update live streaming process */
                live_streaming_process = true;
                /* update live status */
                $('#js_live-status').html('<i class="fas fa-check mr5"></i>' + __['You are live now']).addClass("success");
                hide_live_status();
                /* handle the live buttons */
                $('#js_live-start').hide();
                $('#js_live-end').show();
                /* handle stream buttons */
                $('#js_live-stream-buttons').show();
                $("#mic-btn").removeAttr("disabled");
                $("#cam-btn").removeAttr("disabled");
                $("#comments-btn").removeAttr("disabled");
                /* handle live counter */
                $('#js_live-counter-status').html(__['Online']).removeClass("offline");
                /* handle live recording */
                $('#js_live-recording').show();
                /* set live real-time thread */
                live_realtime_thread = setInterval(function() {
                    /* check live realtime process */
                    if(live_realtime_process) {
                        return;
                    }
                    /* set live realtime process */
                    live_realtime_process = true;
                    var last_comment_id = $("#live-comments").find("ul.js_scroller .comment:last").data('id') || 0;
                    $.post(api['live/reaction'], {'do': 'stats', 'post_id': live_post_id, 'last_comment_id': last_comment_id}, function(response) {
                        /* update live count */
                        $('#js_live-counter-number').html(response.live_count);
                        /* update comments */
                        if(response.comments) {
                            $('#live-comments').find('ul.js_scroller').append(response.comments);
                            $('#live-comments').find('ul.js_scroller').scrollTop($('#live-comments').find('ul.js_scroller')[0].scrollHeight);
                        }
                        /* reset live realtime process */
                        live_realtime_process = false;
                    }, 'json');
                }, 5000);
                /* handle button status */
                button_status($('#js_live-start'), "reset");
            }, 'json');
		}, function(err) {
            /* update live status */
            $('#js_live-status').html('<i class="fas fa-exclamation-circle mr5"></i>' + __['Going live failed'] + ' (' + err + ')').addClass("error");
		});
    });


    // end live stream
    $('body').on('click', '#js_live-end', function () {
        /* handle button status */
        button_status($('#js_live-end'), "loading");
        end_live();
    });
    /* handle closing the window */
    $(window).on('beforeunload', function() {
        end_live();
        return true;
    });


    // mute mic
    $('body').on('click', '.js_mute-mic, .js_unmute-mic', function () {
        var _this = $(this);
        var _do = ($(this).hasClass("js_mute-mic")) ? "mute" : "unmute";
        if(_do == "mute") {
            localStreams.camera.stream.muteAudio();
            _this.removeClass('js_mute-mic btn-secondary').addClass('js_unmute-mic btn-danger');
            _this.find("i").removeClass("fa-microphone").addClass("fa-microphone-slash");
        } else {
            localStreams.camera.stream.unmuteAudio();
            _this.removeClass('js_unmute-mic btn-danger').addClass('js_mute-mic btn-secondary');
            _this.find("i").removeClass("fa-microphone-slash").addClass("fa-microphone");
        }
    });


    // mute cam
    $('body').on('click', '.js_mute-cam, .js_unmute-cam', function () {
        var _this = $(this);
        var _do = ($(this).hasClass("js_mute-cam")) ? "mute" : "unmute";
        if(_do == "mute") {
            localStreams.camera.stream.muteVideo();
            _this.removeClass('js_mute-cam btn-secondary').addClass('js_unmute-cam btn-danger');
            _this.find("i").removeClass("fa-video").addClass("fa-video-slash");
        } else {
            localStreams.camera.stream.unmuteVideo();
            _this.removeClass('js_unmute-cam btn-danger').addClass('js_mute-cam btn-secondary');
            _this.find("i").removeClass("fa-video-slash").addClass("fa-video");
        }
    });


    // mute comments
    $('body').on('click', '.js_mute-comments, .js_unmute-comments', function () {

        var _this = $(this);
        var _do = ($(this).hasClass("js_mute-comments")) ? "mute" : "unmute";
        if(_do == "mute") {
            _this.removeClass('js_mute-comments btn-secondary').addClass('js_unmute-comments btn-danger');
            _this.find("i").removeClass("fa-comments").addClass("fa-comment-slash");
            $('#live-comments').hide();
        } else {
            _this.removeClass('js_unmute-comments btn-danger').addClass('js_mute-comments btn-secondary');
            _this.find("i").removeClass("fa-comment-slash").addClass("fa-comments");
            $('#live-comments').show();
        }
    });


    // change camera
    $('body').on('click', '.js_live-change-camera', function () {
        var camera_id = $(this).attr("id").split('_')[1];
        agora_change_stream_source(camera_id, "video");
    });


    // change mic
    $('body').on('click', '.js_live-change-mic', function () {
        var mic_id = $(this).attr("id").split('_')[1];
        agora_change_stream_source(mic_id, "audio");
    });

});