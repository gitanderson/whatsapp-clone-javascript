import ClassEvent from "../util/ClassEvent";

export default class MicrophoneController extends ClassEvent {

    constructor() {

        super();

        this._available = false;
        this._mimeType = 'audio/webm';

        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(stream => {
            this._available = true;
            this._stream = stream;
            this.trigger('ready', this._stream);
        }).catch(err => {
            console.error(err);
        });
    }

    stop() {
        this._stream.getTracks().forEach(track => {
            track.stop();
        });
    }

    isAvailable() {
        return this._available;
    }

    startRecorder() {
        if (this.isAvailable()) {
            this._mediaRecorder = new MediaRecorder(this._stream, {
                mimeType: this._mimeType
            });

            this._recordedChunks = [];

            this._mediaRecorder.addEventListener('dataavailable', e => {
                if (e.data.size > 0) {
                    this._recordedChunks.push(e.data);
                }
            });

            this._mediaRecorder.addEventListener('stop', e => {
                //Create a blob file to put all tracks from recordedChunks together.
                let blob = new Blob(this._recordedChunks, {
                    type: this._mimeType
                });

                let fileName = `rec${Date.now()}.webm`;

                let file = new File([blob], fileName, {
                    type: this._mimeType,
                    lastModified: Date.now()
                });
            });

            this._mediaRecorder.start();
        }
    }

    stopRecorder() {
        if (this.isAvailable()) {
            this._mediaRecorder.stop();
            this.stop();
        }
    }

}