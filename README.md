# audited-chat
{
    name: Audited Chat,
    version: 1.0.0,
    description:
    {
        - Extend 'Multi User Video Chat With WebRTC' to save client sessions on server.
        - Similar to 'Recording a media element' capture WebM stream chunks.
        - Send stream chunks from each client session to server, and save them there as they are received.
        - Add a link to client to view a list of, and view, or download the saved sessions in WebM format.
    },
    autor: Pavol Szegheo,
    home: ,
    repo: ,
    usage:
    {
        0) The browsers supported at this time are:
            - Google Chrome
            - Mozilla Firefox
        1) Install & Start the nodejs/ws Signaling Server:
            $ npm install
            $ npm start
        2) Access Server from a supported browser using HTTPS at: serverNameOrIp:httpsPort
            - Non-default HTTP & HTTPS ports 8001 & 8443 are set in server.js to avoid possible conflicts
              with another server running on your host that is already using the default 80 and 443 ports.
              Attempting to start a server on ports in use would result in error.
            - To bypass the Display Name prompt, specify url parameter, e.g.: ?displayName=SomeName
            - To access/test from server host, use multiple browser tabs as follows:
                - Tab1: [https://localhost:8443?displayName=Tab1]
                - Tab2: [https://localhost:8443?displayName=Tab2]
                - Tab3: [https://localhost:8443?displayName=Tab3]
                - ... etc.
        3) For production, deploy the Server as a node-windows Windows Service:
            $ npm install -g node-windows
            $ node install_service.js
        4) The saved sessions are in WebM format, that can be directly viewed using the supported browsers.
    }
    Based on:
    {
        name: Multi User Video Chat With WebRTC,
        description:
        {
            - Extend 'A Dead Simple WebRTC Example' to support an arbitrary number of participants.
            - Add CSS styling to:
                - automatically arrange the video containers in a grid on the screen,
                - add labels to identify each participant.
        },
        autor: Jirka Hladis,
        home: [https://www.dmcinfo.com/latest-thinking/blog/id/9852/multi-user-video-chat-with-webrtc],
        repo: [https://www.dmcinfo.com/Portals/0/Blog%20Files/WebRTC.zip],
        Based on:
        {
            name: A Dead Simple WebRTC Example,
            description: An 'as simple as it gets' WebRTC example,
            author: Shane Tully,
            home: [https://shanetully.com/2014/09/a-dead-simple-webrtc-example/]
            repo: [https://github.com/shanet/WebRTC-Example],
        },
    },
    {
        name: Recording a media element,
        contributors: { mfuji09, Jib, Wind1808, cesque, Sheppy },
        home: [https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Recording_a_media_element],
        host: [https://yari-demos.prod.mdn.mozit.cloud/en-US/docs/Web/API/MediaStream_Recording_API/Recording_a_media_element/_samples_/Example],
    }
}

WebRTC Example
==============

#### shane tully (shanetully.com)

An 'as simple as it gets' WebRTC example.

See [https://shanetully.com/2014/09/a-dead-simple-webrtc-example/](https://shanetully.com/2014/09/a-dead-simple-webrtc-example/) for a detailed walkthrough of the code.

Note: This repo is kept updated. The general ideas are there, but the above blog post may be somewhat out of date with the code in this repo.

## Usage

The signaling server uses Node.js and `ws` and can be started as such:

```
$ npm install
$ npm start
```

With the server running, open a recent version of Firefox, Chrome, or Safari and visit `https://localhost:8443`.

* Note the HTTPS! There is no redirect from HTTP to HTTPS.
* Some browsers or OSs may not allow the webcam to be used by multiple pages at once. You may need to use two different browsers or machines.

## TLS

Recent versions of Chrome require secure websockets for WebRTC. Thus, this example utilizes HTTPS. Included is a self-signed certificate that must be accepted in the browser for the example to work.

## Problems?

WebRTC is a rapidly evolving beast. Being an example that I don't check often, I rely on users for reports if something breaks. Issues and pull requests are greatly appreciated.

## License

The MIT License (MIT)

Audited Chat - Copyright (c) 2021 Pavol Szegheo

Multi User Video Chat With WebRTC - Copyright (c) 2019 Jirka Hladis

WebRTC-Example - Copyright (c) 2014 Shane Tully

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
