//webkitURL is deprecated but nevertheless 
URL = window.URL || window.webkitURL;
var gumStream;
//stream from getUserMedia() 
var rec;
//Recorder.js object 
var input;
//MediaStreamAudioSourceNode we'll be recording 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext;
//new audio context to help us record 
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

recordButton.style.display = 'block';
stopButton.style.display = 'none';

recordButton.disabled = false;

//var pauseButton = document.getElementById("pauseButton");
//add events to those 3 buttons 
recordButton.addEventListener("click", function () {

    /* Simple constraints object, for more advanced audio features see

https://addpipe.com/blog/audio-constraints-getusermedia/ */

    var constraints = {
        audio: true,
        video: false
    }
    /* Disable the record button until we get a success or fail from getUserMedia() */

    recordButton.style.display = 'none';
    stopButton.style.display = 'block';
    // pauseButton.disabled = false

    recordButton.disabled = false;
    stopButton.disabled = false;

    /* We're using the standard promise based getUserMedia()
    
    https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia */

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
        /* assign to gumStream for later use */
        gumStream = stream;
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);
        /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
        rec = new Recorder(input, {
            numChannels: 1
        })
        //start the recording process 
        rec.record()
        console.log("Recording started");
    }).catch(function (err) {
        //enable the record button if getUserMedia() fails 
        rerecordButton.style.display = 'block';
        stopButton.style.display = 'none';

        recordButton.disabled = false;
        stopButton.disabled = false;
    });
});

stopButton.addEventListener("click", function stopRecording() {
    console.log("stopButton clicked");
    //disable the stop button, enable the record too allow for new recordings 
    recordButton.style.display = 'block';
    stopButton.style.display = 'none';
    //stopButton.hidden = true;
    recordButton.disabled = false;
    stopButton.disabled = false;
    //reset button just in case the recording is stopped while paused 
    //  pauseButton.innerHTML = 'Pause';
    //  pauseButton.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i> Pause';


    //tell the recorder to stop the recording 
    rec.stop(); //stop microphone access 
    gumStream.getAudioTracks()[0].stop();
    //create the wav blob and pass it on to createDownloadLink 
    rec.exportWAV(convertVoiceToText);
    // DiseaseClassificationCode();
});
//pauseButton.addEventListener("click", function pauseRecording() {
//    console.log("pauseButton clicked rec.recording=", rec.recording);
//    if (rec.recording) {
//        //pause 
//        rec.stop();
//        pauseButton.innerHTML = '<i class="fa fa-eject fa-rotate-90" aria-hidden="true"></i> Resume';
//    } else {
//        //resume 
//        rec.record()
//        // pauseButton.innerHTML = 'Pause';
//        pauseButton.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i> Pause';

//    }
//});

function createDownloadLink(blob) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');
    //add controls to the <audio> element 
    au.controls = true;
    au.src = url;
    //link the a element to the blob 
    link.href = url;
    link.download = new Date().toISOString() + '.wav';
    link.innerHTML = link.download;
    //add the new audio and a elements to the li element 
    li.appendChild(au);
    li.appendChild(link);
    //add the li element to the ordered list 


    // convertVoiceToText()
    recordingsList.appendChild(li);
}

function addEffectTextarea() {


    window.setInterval(function () {

        $("#txtDetailsofoperation").addClass("soundEffect");
    }, 1000);

    window.setInterval(function () {
        $("#txtDetailsofoperation").removeClass("soundEffect");

    }, 2000);


}
function convertVoiceToText(blob) { 
    window.setInterval(addEffectTextarea(), 3000);

    var fd = new FormData();
    fd.append('audio', blob, "audio.wav");
    $.ajax({
        type: 'POST',
        url: 'ConvertVoiceToText',
        cache: false,
        contentType: false,
        processData: false,
        data: fd,
        success: function (data) {
            $("#txtDetailsofoperation").val(data);
            DiseaseClassificationCode();
        },
        error: function () {
        }
    });
}




function DiseaseClassificationCode() {
    var detailsofoperation = $("#txtDetailsofoperation").val();

    $.ajax({
        type: "POST",
        url: '/Voice/DiseaseClassificationCode',
        data:
            JSON.stringify({ description: detailsofoperation }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var oldValue = $("#txtDetailsofoperation").val();
            $("#txtDetailsofoperation").val(oldValue + " | Disease code : " + data);
        },
        error: function () {

        }
    });
}
