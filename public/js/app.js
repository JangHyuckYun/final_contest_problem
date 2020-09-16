import {bookService} from "./bookService.js";

HTMLElement.prototype.hide = function () {
    this.style.display = "none";
}
HTMLElement.prototype.show = function () {
    this.style.display = "block";
}

const $ = element => {
    const list = [...document.querySelectorAll(element)];
    return list.length == 1 ? list[0] : list;
};
HTMLElement.prototype.find = function (element) {
    const list = [...this.querySelectorAll(element)];
    return list.length == 1 ? list[0] : list;
}
HTMLElement.prototype.addEvent = function (event, func) {
    this.addEventListener(event, func);
}
Array.prototype.addEvent = function (event, func) {
    this.forEach(element => element.addEvent(event, func));
}
Array.prototype.find = function (element) {
    return this.map(v => v.find(element));
}
String.prototype.cho = function () {
    const arr = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ".split('');
    const ga = "가".charCodeAt(0);
    return this.split("").map(v =>
        v = arr[Math.floor((v.charCodeAt(0) - ga) / 588)] || v
    ).join('');
}
const
    one = v => document.querySelector(v),
    all = v => Array.from(document.querySelectorAll(v));

class App {
    #target;
    #state;
    #wrapper;

    constructor(wrapper) {
        this.#wrapper = wrapper;
        this.cvs = $(".modal canvas");
        this.ctx = this.cvs.getContext("2d");
        this.cvs.width = 830;
        this.cvs.height = 680;
        this.firstSrc = this.cvs.toDataURL("image/png");
        this.data = [];
        this.videoBool = false;
        this.videoData = [];
        this.bool = false;
        this.tool = "line";
        $(".modal").hide();
        $(".controls").hide();
        this.#target = {
            book_list: one(".book-list .cover"),
            input: one("input[name='search']"),
            choose: one("select[name='choose']"),
            color: $("input[name='color']"),
            line: $("input[name='lineWidth']"),
            fontSize: $("input[name='fontSize']"),
        }
        this.setState({
            files: [],
            canvasIdx: 0,
            canvasBool: false,
            books: bookService.get(),
            searched: [],
            canvasList: [],
            createVideo:false,
            selected: "writer",
        });

        one("input[name='imgFile']").addEventListener("change", e => this.addFile(e));
        one("input[name='videoFile']").addEventListener("change", e => this.addFile(e));

        $("button.noStudy").addEventListener("click", e => {
            this.data.push(this.firstSrc);
            this.videoData.push("");
            this.saveCvsData(this.#state.canvasIdx);
            this.setState({
                canvasBool: true,
                canvasList: [...this.#state.canvasList, ""],
            });
        });

        $("button.prev").addEvent("click", e => {
            this.saveCvsData(this.#state.canvasIdx);
            let cnt = this.#state.canvasIdx - 1;
            cnt = cnt < 0 ? 0 : cnt;
            this.setState({
                canvasIdx: cnt,
                canvasBool: true,
            })
        })

        $("button.next").addEvent("click", e => {
            this.saveCvsData(this.#state.canvasIdx);
            let cnt = this.#state.canvasIdx + 1;
            cnt = cnt >= (this.data.length - 1) ? (this.data.length - 1) : cnt;
            this.setState({
                canvasIdx: cnt,
                canvasBool: true,
            })
        })

        one(".txt").addEventListener("click", e => {
            let text = prompt("텍스트를 입력해 주세요");
            this.toolSetting();
            this.ctx.beginPath();
            this.ctx.fillText(text, 0, 50);
            this.ctx.fill();
            this.ctx.closePath();
        })

        let
            loof,
            bool = false,
            video = $(".modal video"),
            range = $("input[name='range']"),
            startButton = $(".startButton"),
            rotateButton = $(".rotateButton"),
            max = video.duration;


        range.addEvent("input", e => {
            if (this.videoBool) {
                let cnt = Number(e.target.value);
                video.currentTime = cnt;
            }
        });
        startButton.addEvent("click", e => {
            console.log(this.videoBool);
            if (this.videoBool) {
                let txt = e.target.innerText;
                if (txt === "재생") {
                    if (bool) {
                        video.currentTime = 0;
                        bool = false;
                    }
                    loof = setInterval(_ => {
                        range.value = video.currentTime;
                        if (video.currentTime === max && video.loop === false) {
                            e.target.innerText = "재생";
                            clearInterval(loof);
                            video.pause();
                            bool = true;
                        }
                    }, 0.01);
                    video.play();
                    e.target.innerText = "일시정지";

                } else if (txt === "일시정지") {
                    video.pause();
                    clearInterval(loof);
                    e.target.innerText = "재생";
                }
            }
            // this.removeEventListener("click", arguments.callee);
        })

        rotateButton.addEvent("click", e => {
            if (this.videoBool) {
                let txt = e.target.innerText;
                if (txt === "반복안함") {
                    video.loop = true;
                    e.target.innerText = "반복중";
                } else if (txt === "반복중") {
                    video.loop = false;
                    e.target.innerText = "반복안함";
                }
            }
        })

        one("button.downloadHTML").addEventListener("click", e => {
            console.log(this.videoData);
            let page = this.data.slice().map((v, idx) => `
        <div id="box${idx + 1}" class="box rel">
        <div class="img-box rel">
        <img src="${v}" alt="imgs" title="imgs">
</div>
        ${this.videoData[idx] !== "" ? `<div id="video-box${idx + 1}" class="rel">
            <video src="${this.videoData[idx]}" class="videos"></video>
               <div class="controls flex">
                   <button class="startButton">재생</button>
                   <button class="rotateButton">반복안함</button>
                   <input type="range" name="range" min="0" max="100" value="0" step="0.001">
               </div> </div>
    <script>
    window.addEventListener("load", function() {
        console.log("ASd");
        let
            loof = null,
            bool = false,
            target = document.querySelector("#video-box${idx + 1}"),
            video = target.querySelector("video"),
            range = target.querySelector("input[name='range']"),
            startButton = target.querySelector(".startButton"),
            rotateButton = target.querySelector(".rotateButton");

            let
                min = 0,
                max = video.duration;
            range.setAttribute("min", min);
            range.setAttribute("max", max);

            range.addEventListener("input", e => {
                let cnt = Number(e.target.value);
                video.currentTime = cnt;
            });
            startButton.addEventListener("click", e => {
                console.log("click");
                let txt = e.target.innerText;
                if (txt === "재생") {
                    if (bool) {
                        video.currentTime = 0;
                        bool = false;
                    }
                    loof = setInterval(_ => {
                        range.value = video.currentTime;
                        if (video.currentTime === max && video.loop === false) {
                            e.target.innerText = "재생";
                            clearInterval(loof);
                            video.pause();
                            bool = true;
                        }
                    }, 0.01);
                    video.play();
                    e.target.innerText = "일시정지";

                } else if (txt === "일시정지") {
                    video.pause();
                    clearInterval(loof);
                    e.target.innerText = "재생";
                }
            })

            rotateButton.addEventListener("click", e => {
                let txt = e.target.innerText;
                if (txt === "반복안함") {
                    video.loop = true;
                    e.target.innerText = "반복중";
                } else if (txt === "반복중") {
                    video.loop = false;
                    e.target.innerText = "반복안함";
                }
            })
        
    })
</script>` : ''}
</div> `).join('');
            let head = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            list-style: none;
            box-sizing: border-box;
            color: #333;
            text-decoration: none;
        }

        html, body {
            width: 100%;
            height: 100%;
        }

        section {
            width: 100%;
        }

        section > h2 {
            display: none;
        }

        .rel {
            position: relative;
        }

        .ab {
            position: absolute;
        }

        .flex {
            display: flex;
        }

        .grid {
            display: grid;
        }

        .center {
            justify-content: center;
        }

        .align {
            align-items: center;
        }

        .between {
            justify-content: space-between;
        }

        .around {
            justify-content: space-around;
        }

        .cover {
            width: 1550px;
            height: 100%;
            margin: 0 auto;
        }

        .videos {
            z-index: 11;
            width: 600px;
            height: 400px;
            top: 109px;
            left: 2px;
            border: 1px solid #333;
            background: white;
        }

        .controls {
            user-select: none;
            width: 600px;
            height: 30px;
            border: 1px solid #555;
            z-index: 12;
            top: calc(109px + 370px);
            left: 2px;
            background: rgba(0, 0, 0, .5);
            padding: 5px;
            flex-wrap: nowrap;
        }

        .controls button {
            margin: 0px 3px;
        }

        .controls .btn-box {
            width: 20%;
        }
        
        .box {
        border:1px solid #555;
        }

        .controls input {
            width: 70%;
        }
    </style>
</head>
<body>`;
            let body = `
</body>
</html>`;
            let blob = new Blob([head + page + body], {type: "text/html"});
            let a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "book.html";
            document.body.append(a);
            a.click();
            a.remove();
        })
    }

    saveCvsData = idx => {
        this.data[idx] = this.cvs.toDataURL("image/png");
    }

    search = ({target}) => {
        let val = target.value;
        let selected = this.#target.choose.value;
        // bookService.get().slice().filter((v, idx) => console.log(v[selected].cho()));
        this.setState({
            selected,
            files: [],
            canvasBool: false,
            books: bookService.get().slice().filter((v, idx) => (v[selected]).cho().includes(val.cho())),
        });
    }

    listClick = e => {
        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
        this.#state.canvasList = [];
        let target = e.path.filter(v => v.classList && v.classList.contains("list"))[0];
        const list = bookService.get().slice().filter(v => v.name === target.dataset.name)[0];
        $(".modal").show();
        this.pushImage({src: "./book_img/" + list.image, bool: false});
        let secondSrc = this.cvs.toDataURL("image/png");
        this.data = [];
        this.videoData = [];
        this.data.push(secondSrc, this.firstSrc, this.firstSrc);
        this.videoData = Array.from(Array(this.data.length)).fill("");
        this.saveCvsData(this.#state.canvasIdx);
        this.setState({
            canvasList: ["", "", ""],
            canvasIdx: 0,
            canvasBool: true,
        });
    }
    pushImage = ({src, bool}) => {
        let img = new Image(), result;
        img.src = src;
        img.addEventListener("load", e => {
            let scale = Math.min(this.cvs.width / img.width, this.cvs.height / img.height);
            scale = bool ? scale : 1;
            this.ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
        });
    }

    addFile = (e) => {
        let file = e.target.files[0];
        const type = file.type.split("/")[0];

        let filereader = new FileReader();

        filereader.addEventListener("load", e => {
            if (filereader.result) {
                if (type === "image") return this.pushImage({src: filereader.result, bool: true});
                else if (type === "video") {
                    $(".controls").show();
                    this.videoData[this.#state.canvasIdx] = filereader.result;
                    this.createVideo();
                    // this.videoData[this.#state.canvasIdx].onloadedmetadata = _ => this.videoControl(this.videoData[this.#state.canvasIdx]);
                    // this.videoData[this.#state.canvasIdx].removeEventListener("onloadedmetadata", this.videoControl(this.videoData[this.#state.canvasIdx]));
                } else {
                    return alert("이미지 또는 비디오 파일을 선택하여 주세요.");
                }
            }
        })

        filereader.readAsDataURL(file);
    }

    createVideo = _ => {
         $(".controls").hide();
            if (one(".modal .cov video") !== null) $(".modal .cov video").hide();
            this.videoBool = false;
            this.videoData.filter((v, idx) => v !== "").forEach((src, idx) => {
                if (idx === this.#state.canvasIdx) {
                    let video = one(".modal video"), range = one("input[name='range']");
                    $(".controls").show();
                    video.show();
                    video.src = src;
                    video.currentTime = 0;
                    $("input[name='range']").value = 0;
                    one("button.startButton").innerText = "재생";
                    one("button.rotateButton").innerText = "반복안함";

                    video.onloadedmetadata = _ => {
                        range.setAttribute("min", 0);
                        range.setAttribute("max", video.duration);
                        this.videoBool = true;
                    }

                }
            });
    }


    getXY = ({pageX, pageY}) => {
        let
            X = parseInt(pageX),
            Y = parseInt(pageY - this.cvs.offsetTop - $(".modal .cov").offsetTop);

        X = X < 0 ? 0 : X > this.cvs.width ? this.cvs.width : X;
        Y = Y < 0 ? 0 : Y > this.cvs.height ? this.cvs.height : Y;
        // console.log(X, Y);
        return {X, Y};
    }

    toolSetting = _ => {
        this.ctx.fillStyle = this.#target.color.value;
        this.ctx.strokeStyle = this.#target.color.value;
        this.ctx.lineWidth = this.#target.line.value;
        this.ctx.font = `${this.#target.fontSize.value}em Arial`;
    }

    mouseDown = e => {
        let {X, Y} = this.getXY(e);
        this.ctx.moveTo(X, Y);
        this.bool = true;
    }

    mouseMove = e => {
        if (this.bool && this.tool === "line" || this.tool === "era") {
            this.toolSetting();
            if (this.tool === "era") this.ctx.strokeStyle = "white";
            let {X, Y} = this.getXY(e);
            this.ctx.beginPath();
            this.ctx.moveTo(X, Y);
            this.ctx.lineTo(X - 1, Y - 1);
            this.ctx.stroke();
        }
    }

    mouseUp = e => {
        this.bool = false;
        this.toolSetting();
        let {X, Y} = this.getXY(e);
        switch (this.tool) {
            case "rect" :
                this.ctx.fillRect(X, Y, 150, 150);
                break;
            case "circle":
                this.ctx.arc(X, Y, 150, 0, 2 * Math.PI);
                this.ctx.fill();
                break;
            case "try":
                this.ctx.moveTo(X, Y);
                this.ctx.lineTo(X, Y + 100);
                this.ctx.lineTo(X + 100, Y + 100);
                this.ctx.fill();
                break;
        }
    }

    mouseleave = e => {

    }

    event() {
        this.#target.input.addEventListener("input", this.search);

        all("section.book-list .cover .list").forEach(v => {
            v.addEventListener("click", this.listClick)
        });
        if (one(".close")) { //모달이 있을때
            one(".close").addEventListener("click", e => {
                one(".modal").hide();
                if (this.videoData.length !== 0) {
                    $("video").remove();
                    this.videoData = [];
                    this.data = [];
                }
            });
            one(".modal .cov2").addEventListener("click", e => {
                one(".modal").hide();
                if (this.videoData.length !== 0) {
                    $("video").remove();
                    this.videoData = [];
                    this.data = [];
                }
            });

            all(".modal .tools .tool2").forEach(v => {
                v.addEventListener("click", e => {
                    all(".modal .tools .tool2").forEach(v2 => {
                        if (v2 === e.target) {
                            this.tool = v2.dataset.tool;
                            v2.classList.add("active-tool");
                        } else v2.classList.remove("active-tool");
                    })
                });
            });
            $(".modal canvas").addEvent("mousedown", this.mouseDown);
            $(".modal canvas").addEvent("mousemove", this.mouseMove);
            $(".modal canvas").addEvent("mouseup", this.mouseUp);
            $(".modal canvas").addEvent("mouseleave", this.mouseleave);
        }

    }

    render() {
        const {book_list, input, cvs_cover} = this.#target;
        const {books, canvasIdx, canvasBool, canvasList} = this.#state;

        book_list.innerHTML = books.slice().map(({category, name, writer, company, image}) => `
         <div class="list rel" data-name="${name}">
         <img src="./book_img/${image}" alt="${image}" title="${image}">
         <div class="p-box rel">
         <p><b>category: </b> <span class="category">${category}</span></p>
         <p><b>name: </b> <span class="name">${name}</span></p>
         <p><b>writer: </b> <span class="writer">${writer}</span></p>
         <p><b>company: </b> <span class="company">${company}</span></p>
         </div>
         </div>
         `).join('');
        if (canvasBool) {
            this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
            this.pushImage({src: this.data[canvasIdx], bool: true});
            $(".controls").hide();
            if (one(".modal .cov video") !== null) $(".modal .cov video").hide();
            this.videoBool = false;
            this.videoData.filter((v, idx) => v !== "").forEach((src, idx) => {
                if (idx === canvasIdx) {
                    let video = one(".modal video"), range = one("input[name='range']");
                    $(".controls").show();
                    video.show();
                    video.src = src;
                    video.currentTime = 0;
                    $("input[name='range']").value = 0;
                    one("button.startButton").innerText = "재생";
                    one("button.rotateButton").innerText = "반복안함";

                    video.onloadedmetadata = _ => {
                        range.setAttribute("min", 0);
                        range.setAttribute("max", video.duration);
                        this.videoBool = true;
                    }

                }
            });
            $(".modal .now-page").innerHTML = canvasIdx + 1;
            $(".modal .max-page").innerHTML = canvasList.length;
        }
    }

    setState(arg) {
        this.#state = {...this.#state, ...arg};
        this.render();
        this.event();
    }
}

window.onload = async _ => {
    await bookService.load();

    window.app = new App(one("body.book"));
}